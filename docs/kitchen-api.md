# Kitchen API

The delivery platform exposes a small read-only inventory API for each shop's
kitchen. We don't own it. In development, run the mock with
`npx --allow-git=all github:filkaris/openconf-kitchen` (port 4100).

Base URL: `KITCHEN_API_URL` (default `http://localhost:4100`).

## Pagination

All list endpoints are paginated. The page size is fixed by the platform and is
**small** (currently 5 items). Responses look like:

```json
{ "data": [ ... ], "page": 1, "nextPage": 2 }
```

Keep requesting `?page=<nextPage>` until `nextPage` is `null`. Do not assume a
single request returns everything. `apiClient.getAllPages()` does this for you.

## Endpoints

### `GET /shop`

Not paginated: `{ "data": { name, tagline, currency, basePriceCents } }`.
`basePriceCents` is the price of the bun, which every burger includes.

### `GET /categories`

Paginated list of ingredient categories: `{ id, label }`.

### `GET /ingredients`

Paginated list of ingredients.

| Field        | Type    | Notes |
|--------------|---------|-------|
| `id`         | string  | Stable identifier. |
| `name`       | string  | Display name. |
| `category`   | string  | Matches `GET /categories` ids. |
| `priceCents` | number  | Price in integer euro cents. |
| `stock`      | number  | **Portions the kitchen has right now.** Updated live. Use this for anything customer-facing: an ingredient is available when `stock > 0`. |
| `inStock`    | boolean | **Deprecated.** Set by the weekly stock-take and not updated in between, so it is regularly wrong in both directions. Kept for the platform's old reporting tool. Do not use it for availability. |

### `GET /ingredients/:id`

`{ "data": Ingredient }`, or `404 { "error": "ingredient_not_found" }`.

### `GET /allergens`

Not paginated: `{ "data": [{ ingredientId, allergens: string[] }] }`.
Allergen names follow the EU list of 14 (`gluten`, `milk`, `egg`, ...).

## Errors

Errors are JSON `{ "error": string }`. The production API occasionally
returns `503` under load; retry (the `apiClient` does).
