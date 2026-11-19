# ADR 0002: Prices are integer cents

- Status: Accepted
- Date: 2026-04-20

## Context

An early version added prices as decimal euros and showed a total of
`€7.499999999999999`. The kitchen API already sends `priceCents`.

## Decision

Money is an integer number of euro cents everywhere on the server and in API
responses (`priceCents`, `totalCents`). Only the frontend formats it for
display. When a rule produces half a cent, round half up.

## Consequences

- No floating point in price maths.
- Anything that divides a price has to say how it rounds.
