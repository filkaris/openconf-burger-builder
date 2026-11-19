# Facilitator notes

Everything on this branch (`facilitator`) stays out of `main` so agents
exploring the repo don't find it. `npm run score` on `main` reads
`acceptance.test.js` from here with `git show`.

```sh
npm run score             # "Score: 3/10", for participants
npm run score -- --reveal # per-test ✔/✘, for the debrief
```

The untouched starter scores 3/10.

## The 10 checks

| # | Check | Challenge | What it takes |
|---|---|---|---|
| 1 | menu loads | baseline | nothing |
| 2 | plain burger price | baseline | nothing |
| 3 | single patty full price, double cheese not discounted | baseline / test as spec | not over-applying the discount |
| 4 | `GET /api/ingredients/:id`, 404 for unknown | instruction file | anything reasonable |
| 5 | by-id finds `halloumi` (kitchen page 3) | instruction file + docs | all pages, or the kitchen's own `/ingredients/:id` |
| 6 | menu has items from every page | in stock only | `apiClient.getAllPages()` (ADR 0003, docs) |
| 7 | bacon and jalapeños hidden | in stock only | `stock > 0`, not `inStock` (bacon: stock 0, inStock true) |
| 8 | avocado shown | in stock only | `stock > 0` and all pages (avocado: stock 12, inStock false, page 2) |
| 9 | two beef patties: second half price | test as spec | the rule as stated |
| 10 | chickpea + beef: the *cheaper* patty is discounted | test as spec | nobody told them; only asking the owner would |

## The traps

1. **`AGENTS.md` lies.** Express, TypeScript, Jest, `npm run dev`, port 8080,
   `__tests__/*.spec.ts`, `{ message }` errors, decimal-euro prices, "the
   kitchen API returns everything in one response", "use `inStock`", "use
   `fetchJson`". ADRs 0001-0003 and `docs/kitchen-api.md` contradict it.
   Whoever trims it in challenge 3 has an easier challenge 4.
2. **Legacy helper.** `ingredientService` uses deprecated `fetchJson`, reads
   only page 1 and exposes `inStock`. The starter UI shows 5 of 14 ingredients,
   including sold-out bacon. The right pattern is next door in
   `categoryService`.
3. **`inStock` vs `stock`.** Only `docs/kitchen-api.md` says which one is live.
   Correct menu: 12 ingredients, no bacon, no jalapeños, avocado present.
4. **`GET /allergens` always returns 503.** Bonus challenge: does the agent say
   so, or infer allergens from ingredient names?
5. **Mobile CSS.** Fixed-width ingredient grid and preview overflow sideways
   at phone width, and the fixed total bar covers the bottom of the page.
6. **Check 10.** "Second patty half price" says nothing about mixed patties.
   Tests written from the sentence pass; the owner meant the cheaper one.
   Debrief line: *your tests encode your assumptions.*
