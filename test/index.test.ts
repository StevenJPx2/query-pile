import { expect, it, describe } from "vitest";
import { createApi } from "../src";

describe("packageName", () => {
  it.sequential("create a QueryPile-compliant API", () => {
    const api: {
      readonly getItems: (item: string) => readonly [string, "item2"];
      readonly getItems2: (item: number) => (string | number)[];
    } = createApi({
      getItems: (item: string) => [item, "item2"] as const,
      getItems2: (item: number) => [item, "item2"],
    });

    expect(api).toStrictEqual({
      getItems: expect.any(Function),
      getItems2: expect.any(Function),
    });

    const items: readonly [string, "item2"] = api.getItems("item");

    expect(items).toStrictEqual(["item", "item2"]);
  });
});
