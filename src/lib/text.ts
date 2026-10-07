// Shared text-entry normalization. There's no central TextField/Textarea
// component in this app (every form uses a raw `<input>`/`<textarea>`
// styled with the global `.field` class), so this one helper is called
// from each free-text name/title/description field's onChange instead —
// keeps "Farm name", "Product name", "About your farm", etc. consistently
// capitalized everywhere they're displayed, without a wrapper component.
// Deliberately only touches the first character (not title-casing every
// word) so multi-word values like "goat cheese and honey" still read
// naturally. Leading whitespace is left alone — this fires on every
// keystroke, so stripping it here would fight a user who's about to type
// a word after a leading space.
export function capitalizeFirst(value: string): string {
  if (!value) return value;
  const i = value.search(/\S/);
  if (i === -1) return value;
  return value.slice(0, i) + value[i].toUpperCase() + value.slice(i + 1);
}
