import { useMutation, useQuery } from "@tanstack/react-query";
import { createApi, createQueryPile } from "../src";

const api = createApi({
  getItems: (item: string) => [item, "item2"] as const,
  getItems2: (item: number) => [item, "item2"],
});

const queryPile = createQueryPile(api, {
  useGetItems: (item: string) =>
    useQuery({
      queryKey: ["getItems", "item"],
      queryFn: () => api.getItems(item),
    }),
  useGetItems2: () =>
    useMutation({
      mutationKey: ["getItems", "item"],
      // needs to be a function that returns a promise because of
      // ) => Promise<TData> in https://github.com/TanStack/query/blob/7972003bc56ea8b260afed79e59b946931abf405/packages/query-core/src/types.ts#L776
      mutationFn: async ([item]) => await api.getItems2(item),
    }),
});

queryPile.useGetItems("item");
queryPile.useGetItems2();
