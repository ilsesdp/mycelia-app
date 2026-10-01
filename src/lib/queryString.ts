// Shared by the list view (/) and the map view (/map) so switching between
// them — via MapControls' "View" menu — keeps whatever category/open-now
// filters are active, the same way 2.7/2.9 and 2.1/2.10 are the same filter
// state in the prototype, just rendered as a list or a map.
export function buildBrowseQuery(categories: string[], openOnly: boolean): string {
  const params = new URLSearchParams();
  categories.forEach((c) => params.append("cat", c));
  if (openOnly) params.set("open", "1");
  const qs = params.toString();
  return qs ? `?${qs}` : "";
}
