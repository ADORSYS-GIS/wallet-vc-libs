# cloning-decorator

This library was generated with [Nx](https://nx.dev).

# Building the Library

- Before builld, please move to the root directory  of the library folder, that is  **cloning-decorator** and installl dependencies with :
```bash
npm i
```

To build the library and ensure everything is set up correctly without code errors, you can follow these steps:

## 1. Run TypeScript Build
This will compile your TypeScript code based on the `tsconfig.lib.json` file.

```bash
npm run build
```
- This uses the build script defined in your package.json:
```json
"scripts": {
  "build": "tsc -p packages/cloning-decorator/tsconfig.lib.json"
}
```

## 2. Run ESLint (Linting)
Linting will check for any stylistic or programming errors based on your ESLint configuration.

```bash
npm run lint
```
- This uses the lint script defined in your package.json:
```json
"scripts": {
  "lint": "eslint packages/cloning-decorator/src --ext .ts"
}
```

## Full Process Summary:
- **Compile TypeScript**: Run **npm run build** to check for any TypeScript compilation errors.
- **Lint**: Run **npm run lint** to identify and fix any linting issues.
- If all these commands succeed without errors, the library is ready and built correctly!