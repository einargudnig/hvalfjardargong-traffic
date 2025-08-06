# AGENTS.md

## Build, Lint, and DB Commands

- Build: `npm run build`
- Lint: `npm run lint`
- Dev server: `npm run dev`
- Start: `npm run start`
- DB init: `npm run init-db` or `npm run initialize-db`
- No test runner configured; add Jest/Vitest for tests if needed

## Code Style Guidelines

- Use TypeScript strict mode (`tsconfig.json`)
- Use Zod for schema validation and type inference
- Use named and absolute imports (`@/*` path alias)
- React: functional components, props typed explicitly
- Tailwind CSS for styling
- Error handling: always return JSON error responses with status codes
- Use enums/types for domain concepts (e.g., direction)
- Prefer `async/await` for async code
- Use default values in schemas
- camelCase for variables/functions, PascalCase for types/components
- Use Next.js API routes for backend logic
- Use localStorage for client-side tracking
- Use `console.error` for logging errors

## Formatting

- 2 spaces per indent (default Prettier/VSCode)
- Trailing commas in multiline objects/arrays
- Prefer single quotes for strings

## Example Import

```ts
import { NextResponse } from "next/server";
import { dbClient } from "@/lib/db-client";
import { CreateTrafficReportSchema } from "@/lib/schemas";
```

## Error Handling

- Always catch errors in async functions
- Return structured error responses with status codes

## Single Test Execution

- No test runner found; add Jest/Vitest for single test execution
