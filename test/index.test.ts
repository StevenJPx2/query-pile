import { describe, expect, it } from "vitest";
import { createApi } from "../src";

describe("packageName", () => {
  it.sequential("create a QueryPile-compliant API", () => {
    const api = createApi({
      getItems: (item: string) => [item, "item2"] as const,
      getItems2: (item: number) => [item, "item2"] as const,
    });

    expect(api).toStrictEqual({
      getItems: expect.any(Function),
      getItems2: expect.any(Function),
    });

    const items = api.getItems("item");

    expect(items).toStrictEqual(["item", "item2"]);
  });
});
