import type {
  UseInfiniteQueryResult,
  UseMutationResult,
  UseQueryResult,
} from "@tanstack/react-query";

export type ApiLike = Record<string, (arg1: never) => unknown>;

export type ApiArgs<
  Api extends ApiLike,
  P extends keyof Api = keyof Api,
> = Required<Parameters<Api[P]>>;

export type ApiReturn<
  Api extends ApiLike,
  P extends keyof Api = keyof Api,
> = Awaited<ReturnType<Api[P]>>;

export type UseApiReturn<Api extends ApiLike> = {
  [P in keyof Api as `use${Capitalize<P & string>}`]: (
    ...args: never[]
  ) =>
    | UseQueryResult<ApiReturn<Api, P>, Error>
    | UseMutationResult<ApiReturn<Api, P>, Error, ApiArgs<Api, P>[0]>
    | UseInfiniteQueryResult<ApiReturn<Api, P>, Error>;
};

export type ApiArrayReturns<Api extends ApiLike> = {
  [P in keyof Api as ApiReturn<Api, P> extends unknown[]
    ? P
    : never]: ApiReturn<Api, P> extends unknown[] ? ApiReturn<Api, P> : never;
};
