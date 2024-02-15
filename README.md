# QueryPile

[![npm version][npm-version-src]][npm-version-href]
[![npm downloads][npm-downloads-src]][npm-downloads-href]

<!-- [![bundle][bundle-src]][bundle-href] -->
[![Codecov][codecov-src]][codecov-href]

This is a light wrapper over [Tanstack Query](https://github.com/tanstack/query) that will help with organize your API repos.

Suppose you have this API repo:

```ts
const api = {
  getTodo: () => "todo",
  createTodo: (todo) => create(todo),
};
```

You want to use it with Tanstack Query in a type-safe way, making sure you have all the api routes covered.

Here's how it will work with QueryPile:
```ts
import { useQuery, useMutation } from "@tanstack/react-query";
import { createApi, createQueryPile } from "query-pile";

const api = createApi({
  getTodo: () => "todo",
  createTodo: (todo) => create(todo),
});

const useApi = createQueryPile(api, {
  useGetTodo: (todo) =>
    useQuery({
      queryKey: ["todos", todo],
      // This query function is type-safe, it will throw an error if you use any other api endpoint
      queryFn: () => api.getTodo(todo),
    }),
  useCreateTodo: () =>
    useMutation({
      mutationKey: ["todo", "create"],
      // you are provided with the variables by default
      mutationFn: async ([todo]) => await api.createTodo(todo),
    }),
});
```

There are utilities to make optimistic updates with infinite queries easier as well.


## Install

Install package using your favorite package manager:

```sh
# pnpm
pnpm install query-pile @tanstack/react-query
```


## Development

- Clone this repository
- Install latest LTS version of [Node.js](https://nodejs.org/en/)
- Enable [Corepack](https://github.com/nodejs/corepack) using `corepack enable`
- Install dependencies using `pnpm install`
- Run interactive tests using `pnpm dev`

## License

Made with 💛

Published under [MIT License](./LICENSE).

<!-- Badges -->

[npm-version-src]: https://img.shields.io/npm/v/query-pile?style=flat&colorA=18181B&colorB=F0DB4F
[npm-version-href]: https://npmjs.com/package/query-pile
[npm-downloads-src]: https://img.shields.io/npm/dm/query-pile?style=flat&colorA=18181B&colorB=F0DB4F
[npm-downloads-href]: https://npmjs.com/package/query-pile

<!-- [codecov-src]: https://img.shields.io/codecov/c/gh/unjs/query-pile/main?style=flat&colorA=18181B&colorB=F0DB4F
[codecov-href]: https://codecov.io/gh/unjs/query-pile

[bundle-src]: https://img.shields.io/bundlephobia/minzip/query-pile?style=flat&colorA=18181B&colorB=F0DB4F
[bundle-href]: https://bundlephobia.com/result?p=query-pile -->
