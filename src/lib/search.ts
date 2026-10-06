// Shared "farm, market, or product" search used by both browse views
// (list — FarmList — and map — MapView). A farm matches on its own name
// or any product it carries (e.g. "cilantro" finds every farm selling
// cilantro); a market only ever matches on its own name, since markets
// don't carry products in this schema.
export function matchesSearch(name: string, productNames: string[], query: string): boolean {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  if (name.toLowerCase().includes(q)) return true;
  return productNames.some((p) => p.toLowerCase().includes(q));
}

export type SearchMatch = { matchedProduct: string | null };

// Autocomplete match: a narrower prefix-only match (completes what's
// being typed, rather than "contains anywhere"), same relationship to
// matchesSearch() above as the two always had for farm/market names.
// Returns which product matched, if the match came from a product rather
// than the name itself, so the suggestion row can say so.
export function suggestionMatch(name: string, productNames: string[], query: string): SearchMatch | null {
  const q = query.trim().toLowerCase();
  if (!q) return null;
  if (name.toLowerCase().startsWith(q)) return { matchedProduct: null };
  const product = productNames.find((p) => p.toLowerCase().startsWith(q));
  if (product) return { matchedProduct: product };
  return null;
}
