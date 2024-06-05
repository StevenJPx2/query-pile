import { useMutation, useQuery } from "@tanstack/react-query";
import { describe, expect, it } from "vitest";
import { createApi, createQueryPile } from "../src";

describe("packageName", () => {
  const api = createApi({
    getItems: (item: string) => [item, "item2"] as const,
    setItems: (item: { s: number }) => [item, "item2"] as const,
  });

  it.sequential("create a QueryPile-compliant API", () => {
    expect(api).toStrictEqual({
      getItems: expect.any(Function),
      setItems: expect.any(Function),
    });
    const items = api.getItems("item");

    expect(items).toStrictEqual(["item", "item2"]);
  });

  it.sequential("creates a QueryPile object", () => {
    const pile = createQueryPile(api, {
      useGetItems: (item: string) => {
        return useQuery({ queryKey: [], queryFn: () => api.getItems(item) });
      },
      useSetItems() {
        return useMutation({
          mutationFn: async (item) => await Promise.resolve(api.setItems(item)),
        });
      },
    });

    expect(pile);
  });
});
