# Frontend TypeScript migration

The `frontend/user` and `frontend/admin` applications now compile exclusively from TypeScript source (`.ts` and `.tsx`). JavaScript remains only where tooling requires it, such as the Babel, Jest, and ESLint configuration files; neither application's `src/` directory contains JavaScript or JSX modules.

## Tooling

Both applications use TypeScript with strict, no-emit compiler projects, bundler module resolution, React's automatic JSX runtime, and `allowJs: false`. Vite configuration and each HTML entrypoint target the TypeScript application entry module. Jest transforms TypeScript and discovers only TypeScript test files.

## Type contracts

`src/types/` defines API-wire contracts for authentication, events and media, registration and payments, admin resources, reports, pagination, and API errors. Schemas export inferred form types, while API clients, contexts, route state, hooks, and Axios extensions consume those contracts.

## Validation

Run these commands from each application directory:

```sh
npm install
npm run typecheck
npm test
npm run build
npm run dev
```

The migration changes frontend typing, extensions, and build/test tooling only. It does not modify backend code, API behavior, routes, rendered UI, or runtime application behavior.
