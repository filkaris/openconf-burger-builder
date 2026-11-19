// Price of one burger, in integer cents (ADR 0002).
//
//   calculateTotal({ basePriceCents: 250, items: [{ id, category, priceCents }, ...] })
//
// `items` is the burger's ingredients in stacking order; duplicates are allowed.
export function calculateTotal({ basePriceCents, items }) {
  return items.reduce((total, item) => total + item.priceCents, basePriceCents);
}
