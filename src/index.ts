import type { ApiLike, UseApiReturn } from "./types";
export { updateInfiniteQueryFactory } from "./infinite-query";

/**
 * Create an API object compliant with createQueryPile
 * @param api - An object with functions that return promises
 * @returns The same object that was passed in
 * */
export const createApi = <const Api extends ApiLike>(api: Api) => api;

/**
 * Create a query pile object
 * @param _api - The API object created with createApi
 * @param changed - The object returned from createQueryPile
 * @returns The same object that was passed in
 * @example
 * ```tsx
 * import { useMutation, useQuery } from "@tanstack/react-query";
 * import { createApi, createQueryPile } from "../src";
 * const api = createApi({
 *  getItems: (item: string) => [item, "item2"] as const,
 * });
 * const queryPile = createQueryPile(api, {
 *  useGetItems: (item: string) =>
 *   useQuery({
 *    queryKey: ["getItems", "item"],
 *    queryFn: () => api.getItems(item),
 *   }),
 * });
 * */
export const createQueryPile = <
  const Api extends ApiLike,
  const ApiR extends UseApiReturn<Api>,
>(
  _api: Api,
  changed: ApiR,
) => changed;
