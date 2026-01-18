# Tony Server 🚀

**Tony** is an extremely lightweight, configuration‑driven Node.js Web
API server scaffold. It is designed for developers who pursue maximal
performance and code purity.

Unlike traditional frameworks, Tony embraces a **No TypeScript**
philosophy, offering type safety through **JSDoc**, and using **static
code generation** to transform route configuration into a physical
directory structure, completely eliminating runtime route‑lookup
overhead.

------------------------------------------------------------------------

## Core Features

-   **Zero Framework**: Built on native Node.js `http` module with no
    heavy runtime framework dependencies.
-   **Static Routing**: Generates nested `if-else` dispatch logic;
    routing performance approaches $O(1)$.
-   **ESM First**: Fully embraces modern ES6 module standards
    (`import/export`).
-   **JSDoc Powered**: Full IDE autocomplete and type checking, even in
    pure JavaScript.
-   **Object‑Driven Config**: Elegant object-based routing configuration
    that makes API structure instantly understandable.

------------------------------------------------------------------------

## Project Architecture

The generated project follows a highly decoupled physical directory
structure:

-   **`/tony`**: Core helper library. Injects utilities like
    `res.json()` and `res.status()`.
-   **`/middlewares`**: Stores business middlewares (auth, rate
    limiting, logging, etc.).
-   **`/routers`**: Core routing tree. Each folder represents an API
    path:
    -   `index.js`: Auto‑generated router dispatcher handling middleware
        chains and child route matching.
    -   `*.service.js`: Actual business logic processors.

------------------------------------------------------------------------

## Quick Start

### 1. Prepare Environment

Ensure your `package.json` is configured for ESM:

``` json
{
  "type": "module",
  "scripts": {
    "build": "node generator.js",
    "dev": "node dev-server.js"
  }
}
```

### 2. Define API (tony.config.js)

Example Audiobooks API structure:

``` js
export default {
  server: { port: 3000 },
  routes: {
    "/api/v1/books": {
      services: ["list", "search"],
      middlewares: [["./cache.js"]]
    },
    "/api/v1/me/library": {
      middlewares: [["./jwtAuth.js"]],
      services: ["getCollection", "addBook"]
    }
  }
};
```

### 3. Generate & Run

``` bash
npm run build   # Generate static directories & code
npm run dev     # Start dev server (with hot reload)
```

------------------------------------------------------------------------

## Development Guide

### Writing a Service

Tony automatically generates JSDoc‑rich templates to give pure JS a
strong typing experience:

``` js
/**
 * @param {import('../../../tony/helpers').EnhancedRequest} req
 * @param {import('../../../tony/helpers').EnhancedResponse} res
 */
export async function list(req, res) {
  res.status(200).json({
    success: true,
    data: [{ id: 1, title: "The Great Gatsby" }]
  });
}
```

### Writing Middleware

Middlewares return `false` to stop the request chain:

``` js
export default function auth(options) {
  return async (req, res) => {
    if (!req.headers.authorization) {
      res.status(401).json({ error: "Unauthorized" });
      return false; // Stop chain
    }
  };
}
```

------------------------------------------------------------------------

## Performance

Traditional frameworks often rely on dynamic regex‑based routing. Tony
transforms routing into static, precompiled branch code.

This reduces CPU overhead and makes the execution path fully
observable---you can directly inspect the generated `index.js` to
understand the full request flow.

------------------------------------------------------------------------

## License

MIT
