import { QueryKey, useQueryClient } from "@tanstack/react-query";
import { ApiArrayReturns, ApiLike } from "./types";

export const updateInfiniteQueryFactory = <Api extends ApiLike>(
  queryClient: ReturnType<typeof useQueryClient>,
) => {
  const updateInfiniteQuery = async <
    T extends keyof ApiArrayReturns<Api>,
    Item extends ApiArrayReturns<Api>[T] = ApiArrayReturns<Api>[T],
  >(
    queryKey: QueryKey,
    updateFn: (previousData: Item[]) => Item[],
  ) => {
    type DataType = { pages: Item[]; pageParams: number[] };
    await queryClient.cancelQueries({
      queryKey,
    });

    const previousData = queryClient.getQueryData<DataType>(queryKey) ?? {
      pages: [] as Item[],
      pageParams: [],
    };

    queryClient.setQueryData<DataType>(queryKey, {
      ...previousData,
      pages: updateFn(previousData.pages),
    });

    return previousData;
  };

  updateInfiniteQuery.remove = async <T extends keyof ApiArrayReturns<Api>>(
    queryKey: QueryKey,
    predicate: (item: ApiArrayReturns<Api>[T][number]) => boolean,
  ) =>
    await updateInfiniteQuery<T>(
      queryKey,
      (previousData) =>
        previousData.map((page) =>
          // @ts-ignore
          page.filter((data) => !predicate(data)),
        ) as ApiArrayReturns<Api>[T][],
    );

  updateInfiniteQuery.unshift = async <T extends keyof ApiArrayReturns<Api>>(
    queryKey: QueryKey,
    item: ApiArrayReturns<Api>[T][number],
  ) =>
    await updateInfiniteQuery<T>(
      queryKey,
      (previousData) => [[item], ...previousData] as ApiArrayReturns<Api>[T][],
    );

  updateInfiniteQuery.unshiftArray = async <
    T extends keyof ApiArrayReturns<Api>,
  >(
    queryKey: QueryKey,
    item: ApiArrayReturns<Api>[T],
  ) =>
    await updateInfiniteQuery<T>(
      queryKey,
      (previousData) => [item, ...previousData] as ApiArrayReturns<Api>[T][],
    );

  updateInfiniteQuery.push = async <T extends keyof ApiArrayReturns<Api>>(
    queryKey: QueryKey,
    item: ApiArrayReturns<Api>[T][number],
  ) =>
    await updateInfiniteQuery<T>(
      queryKey,
      (previousData) => [...previousData, [item]] as ApiArrayReturns<Api>[T][],
    );

  updateInfiniteQuery.pushArray = async <T extends keyof ApiArrayReturns<Api>>(
    queryKey: QueryKey,
    item: ApiArrayReturns<Api>[T],
  ) =>
    await updateInfiniteQuery<T>(
      queryKey,
      (previousData) => [...previousData, item] as ApiArrayReturns<Api>[T][],
    );

  return updateInfiniteQuery;
};
