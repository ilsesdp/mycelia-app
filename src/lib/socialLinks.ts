// Turns what the owner typed into onboarding's Website & social media
// fields (1.11) / Edit profile (5.3) into an actual clickable URL. Those
// fields accept loose input — "yourfarm.com", "@yourfarm",
// "facebook.com/yourfarm" — so this fills in the protocol (and, for
// Instagram/Facebook, the host) rather than assuming the owner typed a
// full URL.
export function websiteHref(value: string | null): string | null {
  const v = value?.trim();
  if (!v) return null;
  return /^https?:\/\//i.test(v) ? v : `https://${v}`;
}

export function instagramHref(value: string | null): string | null {
  const v = value?.trim();
  if (!v) return null;
  if (/^https?:\/\//i.test(v)) return v;
  if (/^instagram\.com/i.test(v)) return `https://${v}`;
  return `https://instagram.com/${v.replace(/^@/, "")}`;
}

export function facebookHref(value: string | null): string | null {
  const v = value?.trim();
  if (!v) return null;
  if (/^https?:\/\//i.test(v)) return v;
  if (/^facebook\.com/i.test(v)) return `https://${v}`;
  return `https://facebook.com/${v.replace(/^@/, "")}`;
}
