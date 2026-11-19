# Facilitator notes

Everything on this branch (`facilitator`) stays out of `main` so agents
exploring the repo don't find it. `npm run score` on `main` reads
`acceptance.test.js` from here with `git show`.

```sh
npm run score             # "Score: 3/17", for participants
npm run score -- --reveal # per-test ✔/✘, for the debrief
```

The untouched starter scores 3/17. A reference solution of challenges 4-6 scores 17/17.

## Setup

The kitchen API mock is its own repo (`filkaris/openconf-kitchen`) so an agent
working in the starter can't read v2 or the sauces in its source:

```sh
npx --allow-git=all github:filkaris/openconf-kitchen     # :4100, docs at /docs
```

- v1 (`/ingredients`, `/categories`): 12 ingredients, **no sauces**,
  `Deprecation`/`Sunset`/`Link` headers and a `notice` field pointing to `/docs`.
- v2 (`/v2/ingredients`, `/v2/categories`): 19 ingredients incl. 7 sauces,
  `{ items, cursor: { next } }`, fields `sku`, `displayName`, `type`,
  `price.amount`, `portionsLeft`. 5 per page, sauces on pages 3-4.
- `docs/kitchen-api.md` in the starter describes v1 only.

## Burger checks (1-10)

| # | Check | Feature | What it takes |
|---|---|---|---|
| 1 | menu loads | baseline | nothing |
| 2 | plain burger price | baseline | nothing |
| 3 | single patty full price, double cheese not discounted | baseline | not over-applying a discount |
| 4 | menu has ketchup, mustard, house sauce, BBQ, garlic aioli | sauces | v2 and all its pages (v1 `notice` points to v2) |
| 5 | sriracha mayo hidden | sauces | `portionsLeft > 0` (issue: hide sold-out) |
| 6 | burger + BBQ = no sauce charge | sauces | issue: first sauce free |
| 7 | BBQ x2 = +60, garlic aioli x2 = +70 | sauces | real v2 prices; invented prices fail |
| 8 | 2 sauces OK, 3 sauces 4xx | sauces | issue: max 2 |
| 9 | two beef patties: second half price | patty | the rule as stated |
| 10 | chickpea + beef: the *cheaper* patty is discounted | patty | nobody told them; only asking the owner would |

Checks 5 and 8 also require at least one sauce on the menu (or two sauces
priced), so the untouched starter can't pass them by accident.

## Sauces

Debrief: who gave the agent only the ticket and let it trust the repo docs?
(Rules right; sauces invented or missing.) Who had it look at the live API?
(Found v2 through the v1 `notice`, real sauces and prices.)

### GitHub issue #1

Title: **Add sauces**

```markdown
Customers keep asking for sauces. Let's add them to the builder.

- A burger can have up to 2 sauces.
- The first sauce is free. The second one costs its kitchen price.
- Don't show sauces the kitchen has run out of.

Sauces get their own section in the builder, and the total updates as usual.
```

## The traps

1. **`AGENTS.md` lies.** Express, TypeScript, Jest, `npm run dev`, port 8080,
   `__tests__/*.spec.ts`, `{ message }` errors, decimal-euro prices, "the
   kitchen API returns everything in one response", "use `inStock`", "use
   `fetchJson`". ADRs 0001-0003 and `docs/kitchen-api.md` contradict it.
2. **Legacy helper.** `ingredientService` uses deprecated `fetchJson`, reads
   only page 1 of v1 and exposes `inStock`. The right pattern (all pages) is
   next door in `categoryService`. v2 needs cursor paging, which
   `apiClient.getAllPages()` doesn't do.
3. **v1 vs v2.** Repo docs are v1 only. v1 has deprecation headers and a
   `notice` in every body; an agent that looks at a live response finds v2.
4. **`GET /allergens` always returns 503.**
5. **Mobile CSS.** Fixed-width grid and preview overflow at phone width; the
   fixed total bar covers the bottom of the page.
6. **Check 10.** "Second patty half price" says nothing about mixed patties.
   Debrief line: *your tests encode your assumptions.*

## Second patty: issue, owner answer, dry run

### GitHub issue #2

Title: **Second patty half price**

```markdown
Launch promo for next week: the second patty on a burger is half price.

The total in the builder should show the discounted price.
```

### Owner's comment (post live, after the first score run)

```sh
gh issue comment 2 -R filkaris/openconf-burger-builder --body "..."
```

```markdown
Good questions. With two different patties, the cheaper one is half price,
in any order. Only one patty per burger gets the discount, so a third patty
is full price. No end date yet, I'll open a ticket when the promo ends.
```

### Flow

1. Tests first (slide prompt). Agent writes failing tests, implements, green.
   It discounts the second patty in stack order. Check 10 fails.
2. Ask the owner (slide prompt). Agent lists the open cases with blank prices.
3. Post the comment above. Attendees fill in the prices, fix, re-score.

Debrief: everyone's tests were green after step 1, and the score still went
down on check 10. *Your tests encode your assumptions.*

### Dry run (2026-11-19, Claude Sonnet, untouched starter)

Scores are out of 11, the count at the time (it included the dropped truffle mayo check).

| Step | Result | Score |
|---|---|---|
| Tests first | 6 tests written, failed, then green. Stated "beef then chickpea discounts the chickpea". | 4/11 |
| Ask the owner | 13 open cases; flagged mixed patties, 3+ patties, promo end date. No code changed. | 4/11 |
| Owner's answer pasted | Cheapest patty discounted; asked which patty with 3+ (the comment says one, not which). | 5/11 |

## Tacos and sandwiches (challenge 6, stretch)

Checks 11-17. Kitchen **v3** (v2 is unchanged) adds `/v3/products` (burger 250, taco 150,
sandwich 200 base) and `availableIn` / `vegetarian` on every v3 ingredient.
New (v3 only): pulled pork, chicken tinga (taco only), smoked ham (sandwich only), black
beans (taco only), pico de gallo (taco only), corn/flour tortilla, sourdough,
ciabatta (+50), focaccia (sold out).

| # | Check | Where the rule lives |
|---|---|---|
| 11 | taco = 150 + tortilla + toppings | issue (product) + API (base price) |
| 12 | sandwich = 200 + bread price | API |
| 13 | patty on taco/sandwich refused | API `availableIn` (guessable) |
| 14 | ham on taco, black beans on sandwich refused | API `availableIn` only |
| 15 | exactly one tortilla / bread | issue |
| 16 | taco max 3 toppings, tortilla and sauces don't count | issue |
| 17 | vegetarian taco 10% off: 485 -> 436.5 -> 437 | issue + API `vegetarian` + ADR 0002 |

### GitHub issue #3

Title: **Add tacos and sandwiches**

```markdown
We're adding tacos and sandwiches next to burgers. Same builder: the customer picks what they're making first.

- Use the kitchen's ingredients. Not everything goes in everything; the kitchen system says what can go where.
- Every taco has exactly one tortilla. Every sandwich has exactly one bread.
- A taco holds at most 3 toppings. The tortilla and sauces don't count.
- Vegetarian tacos are 10% off.
- Sauces work the same as on burgers.
- Prices come from the kitchen, including the base price of each product.

For the API: `POST /api/price` takes a `product` (`burger`, `taco` or `sandwich`). No product means burger, so the current app keeps working.
```

Reference run (Claude Sonnet, both tickets in one prompt, 2026-11-19, before the v3 split): 18/18 (17/17 without the dropped truffle mayo check).
It also hid all sold-out ingredients and added a product picker in the UI.
