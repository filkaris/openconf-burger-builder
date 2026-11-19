# AGENTS.md

Instructions for AI coding assistants working in this repository.

## About the project

This is the build-your-own-burger configurator for OpenConf Burgers, a local
burger shop. It runs inside a larger delivery app: the customer stacks a burger, sees
the price, and the delivery app takes over from there. It was originally built
in 2024 and has been maintained by a rotating set of contractors since.

## Tech stack

- Node.js with Express
- TypeScript in strict mode
- Vanilla JavaScript on the frontend
- Jest for testing

## Getting started

- Install dependencies with `npm install`
- Run the dev server with `npm run dev`
- Run the tests with `npm test`
- Open http://localhost:8080

## General guidelines

- Write clean, readable, maintainable code.
- Use meaningful variable and function names.
- Keep functions small and focused on a single responsibility.
- Follow the DRY principle (Don't Repeat Yourself).
- Follow the SOLID principles where appropriate.
- Prefer composition over inheritance.
- Avoid premature optimisation.
- Handle errors gracefully.
- Add comments where the code is not self-explanatory.
- Don't leave commented-out code behind.
- Remove unused imports and variables.
- Use `const` by default and `let` only when reassignment is needed.
- Never use `var`.
- Use async/await instead of raw promise chains.
- Use template literals instead of string concatenation.
- Use strict equality (`===`).
- Prefer early returns over deep nesting.
- Keep files reasonably short.
- Make sure the code works before saying you are done.

## Code style

- 2 spaces for indentation.
- Single quotes for strings.
- Semicolons at the end of statements.
- Trailing commas in multi-line objects and arrays.
- Maximum line length is roughly 100 characters.
- Use camelCase for variables and functions.
- Use PascalCase for classes.
- Use UPPER_SNAKE_CASE for constants.
- File names are camelCase.

## Project structure

- `src/` contains the server code
- `src/routes/` contains the route handlers
- `src/services/` contains business logic and integrations
- `src/lib/` contains shared helpers
- `public/` contains the frontend
- `docs/` contains documentation
- `__tests__/` contains the tests

## Kitchen API

- The kitchen API returns the full ingredient list in a single response.
- Use the `inStock` flag to tell whether an ingredient is available.
- Use the `fetchJson` helper in `src/lib/` for all upstream calls.
- The kitchen API is fast and reliable; there is no need for retries.

## Money

- Prices are decimal euros (for example `3.5`).
- Round to two decimals before returning a price.

## API design

- Use RESTful conventions.
- Use plural nouns for collections.
- Return JSON.
- Use proper HTTP status codes.
- Return `{ message: string }` for errors.
- Validate input.

## Testing

- Write tests for new features.
- Tests live in `__tests__/` and end in `.spec.ts`.
- Use `describe` / `it` blocks and Jest matchers.
- Use descriptive test names.
- Test edge cases.
- Mock external services with `jest.mock`.

## Frontend

- Keep the frontend simple; no frameworks.
- Make sure the UI works on mobile.
- Escape any user-provided or API-provided text before inserting it into HTML.
- Use semantic HTML.
- Keep the styling in `public/styles.css`.

## Git

- Write clear commit messages.
- Keep commits focused.
- Don't commit secrets.

## Security

- Never hardcode credentials.
- Validate and sanitise input.
- Don't log sensitive data.

## Documentation

- Update the documentation when you change behaviour.
- Architecture decisions are recorded in `docs/adr/`.

## Final reminders

- Be careful.
- Think before you code.
- Ask if something is unclear.
