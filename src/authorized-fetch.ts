import { ValidateFunction, validateData } from "./internal/validate";

export function validatedFn<
  T extends Array<any>,
  U = ValidateFunction<unknown>,
>(
  fn: (...args: T) => Promise<void>,
  parser: U = validateData<void>,
): (...args: T) => Promise<U> {
  return async (...args: T) => parser(await fn(...args));
}

export type AuthorizedFetchFunctionOptions<Input, Query, Output> = {
  outputParser?: z.ZodType<Output>;
  queryParser?: z.ZodType<Query>;
  inputParser?: z.ZodType<Input>;
  shouldAuthenticate?: boolean;
};

export function authorizedFetch<
  Input extends FetchOptions<"json">["body"] = undefined,
  Query extends FetchOptions<"json">["query"] = FetchOptions<"json">["query"],
  Output = unknown,
  Endpoint = string | ((...args: string[]) => string),
  EndpointArgs extends string[] = Endpoint extends (...args: string[]) => string
    ? Parameters<Endpoint>
    : [never],
>(
  endpoint: Endpoint,
  options: Omit<FetchOptions<"json">, "body" | "query" | "signal"> & {
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
  return async (bearerToken, args) => {
    const argOpts = args ?? {};
    const {
      queryParser = z.any(),
      inputParser = z.undefined(),
      outputParser = z.any(),
      shouldAuthenticate = true,
      signal,
      ...init
    } = options;

    if (shouldAuthenticate && !bearerToken)
      throw Error(`Not Authenticated 🚫 for ${endpoint}`);

    let body = undefined;
    if ("body" in argOpts) body = inputParser.parse(argOpts.body);

    const resolvedEndpoint: string =
      endpoint instanceof Function &&
      "endpointArgs" in argOpts &&
      Array.isArray(argOpts.endpointArgs)
        ? endpoint(...argOpts.endpointArgs)
        : endpoint;

    if (isDev)
      console.log({
        ...init,
        body,
        query:
          "query" in argOpts ? queryParser.parse(argOpts.query) : undefined,
        headers: Object.assign(
          init.headers ?? {},
          !!bearerToken ? { Authorization: `Bearer ${bearerToken}` } : {},
        ),
      });

    const response = await apiFetch<Output>(resolvedEndpoint, {
      ...init,
      body,
      signal: signal?.() ?? AbortSignal.timeout(10000),
      query: "query" in argOpts ? queryParser.parse(argOpts.query) : undefined,
      headers: Object.assign(
        init.headers ?? {},
        !!bearerToken ? { Authorization: `Bearer ${bearerToken}` } : {},
      ),
      onResponse(ctx) {
        logEvent("select_content", {
          content_type: resolvedEndpoint,
          item_id: JSON.stringify({
            request: ctx.request,
            response: ctx.response,
          }),
        });
        init.onResponse?.(ctx);
      },
      onResponseError(ctx) {
        logEvent("exception", {
          fatal: false,
          description: `Error for ${resolvedEndpoint}: ${ctx.error?.message}`,
        });
        toast.error("Your request couldn't be processed! 😓");
        console.error(ctx.error);
        init.onResponseError?.(ctx);
      },
    });
    return outputParser.parse(response);
  };
}

export type AuthorizedFetchFn = typeof authorizedFetch;
