import { ValidateFunction, validateData } from "./internal/validate";

export function validatedFn<T extends never[], Return = void>(
  fn: (...args: T) => Promise<Return>,
  parser: ValidateFunction<Return> = (arg: unknown): arg is undefined =>
    arg === undefined,
): (...args: T) => Promise<Return> {
  return async (...args: T) => validateData(await fn(...args), parser);
}

export type AuthorizedFetchFunctionOptions<Input, Query, Output> = {
  outputParser?: ValidateFunction<Output>;
  queryParser?: ValidateFunction<Query>;
  inputParser?: ValidateFunction<Input>;
  shouldAuthenticate?: boolean;
};

export function authorizedFetch<
  Input = undefined,
  Query = undefined,
  Output = unknown,
  Endpoint = string | ((...args: string[]) => string),
  EndpointArgs extends string[] = Endpoint extends (...args: string[]) => string
    ? Parameters<Endpoint>
    : [never],
>(
  endpoint: Endpoint,
  // @ts-expect-error TODO: Fix this
  options: Omit<FetchOptions<"json">, "body" | "query" | "signal"> & {
    // @ts-expect-error TODO: Fix this
    signal?: () => FetchOptions<"json">["signal"];
  } & AuthorizedFetchFunctionOptions<Input, Query, Output> = {},
): (
  bearerToken: string | null,
  ...args: [Input] extends [undefined]
    ? EndpointArgs extends [never]
      ? [args?: { query?: Query }]
      : [args: { query?: Query; endpointArgs: EndpointArgs }]
    : EndpointArgs extends [never]
      ? [args: { query?: Query; body: Input }]
      : [args: { query?: Query; body: Input; endpointArgs: EndpointArgs }]
) => Promise<Output> {
  // @ts-expect-error TODO: Fix this
  return async (bearerToken, args) => {
    const argOpts = args ?? {};
    const {
      queryParser = (arg: unknown): Query => arg as Query,
      inputParser = (arg: unknown): Input => arg as Input,
      outputParser = (arg: unknown): Output => arg as Output,
      shouldAuthenticate = true,
      signal,
      ...init
    } = options;

    if (shouldAuthenticate && !bearerToken) {
      throw new Error(`Not Authenticated 🚫 for ${endpoint}`);
    }

    let body: Input | undefined;
    if ("body" in argOpts) {
      // @ts-expect-error TODO: Fix this
      body = inputParser(argOpts.body);
    }

    const resolvedEndpoint: string =
      endpoint instanceof Function &&
      "endpointArgs" in argOpts &&
      Array.isArray(argOpts.endpointArgs)
        ? endpoint(...argOpts.endpointArgs)
        : endpoint;

    // @ts-expect-error TODO: Fix this
    const response = await apiFetch<Output>(resolvedEndpoint, {
      ...init,
      body,
      signal: signal?.() ?? AbortSignal.timeout(10_000),
      query: "query" in argOpts ? queryParser(argOpts.query) : undefined,
      headers: Object.assign(
        init.headers ?? {},
        bearerToken ? { Authorization: `Bearer ${bearerToken}` } : {},
      ),
    });
    return outputParser(response);
  };
}

export type AuthorizedFetchFn = typeof authorizedFetch;
