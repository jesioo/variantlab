# variantlab

Switch between variants of a React component live in the browser.

The library and its documentation live in [`packages/variantlab`](packages/variantlab/README.md).

## Repository layout

- `packages/variantlab` is the published library.
- `playground` is a Vite app that uses the library source directly, with end to end tests in Playwright.

## Development

You need Node 22.12 or newer and pnpm 10.

```sh
pnpm install
pnpm dev
```

`pnpm dev` starts the playground.
Library changes show up without a rebuild.

| Command          | What it does                                                  |
| ---------------- | ------------------------------------------------------------- |
| `pnpm test`      | Unit tests of the library in Vitest.                          |
| `pnpm test:e2e`  | Builds the playground and runs the Playwright tests on it.    |
| `pnpm typecheck` | Type checks every package, including the type level tests.    |
| `pnpm lint`      | Lints the whole repository.                                   |
| `pnpm format`    | Formats the whole repository with Prettier.                   |
| `pnpm build`     | Builds the library and validates it with publint and attw.    |
| `pnpm check`     | Runs formatting, lint, type checks, unit tests and the build. |

Unit and end to end tests fail on any unexpected console error or warning.

## Releases

Releases go through [Changesets](https://github.com/changesets/changesets).
Run `pnpm changeset` in every pull request that changes the published library.

To release, run `pnpm changeset version` and commit the result.
Then run `pnpm release`, which runs every check and publishes the new version to npm.
Publishing from CI is not set up yet, so `pnpm release` needs `npm login` first.
