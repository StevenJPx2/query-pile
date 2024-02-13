import { ApiLike, UseApiReturn } from "./types";
export { updateInfiniteQueryFactory } from "./infinite-query";

export const createApi = <const Api extends ApiLike>(api: Api) => api;

export const createQueryPile = <
  const Api extends ApiLike,
  const ApiR extends UseApiReturn<Api>,
>(
  api: Api,
  setup: (api: Api) => ApiR,
) => setup(api) satisfies ApiR;
