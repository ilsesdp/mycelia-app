import { Icon, type IconName } from "@/components/ui/Icon";
import { websiteHref, instagramHref, facebookHref } from "@/lib/socialLinks";

// Ports the prototype's "Follow"/"Connect online" section (Instagram/
// Facebook/website) on the About tab — owner's own (4.8) and the public
// farm profile (2.4) both render this the same way, same values entered
// in onboarding's Website & social media (1.11) / Edit profile (5.3).
// Renders nothing when the farm hasn't set any of the three. `disabled`
// is for the onboarding Preview screen (1.12) — same reasoning as
// DirectionsButton's own disabled prop: nothing should be tappable there
// except "Publish my farm", so the rows render as plain (non-navigating)
// divs instead of real links.
export function ConnectOnline({
  website,
  instagram,
  facebook,
  disabled = false,
}: {
  website: string | null;
  instagram: string | null;
  facebook: string | null;
  disabled?: boolean;
}) {
  const links: { icon: IconName; label: string; href: string }[] = [];
  const websiteUrl = websiteHref(website);
  const instagramUrl = instagramHref(instagram);
  const facebookUrl = facebookHref(facebook);
  if (websiteUrl) links.push({ icon: "website", label: website!.trim(), href: websiteUrl });
  if (instagramUrl) links.push({ icon: "instagram", label: instagram!.trim(), href: instagramUrl });
  if (facebookUrl) links.push({ icon: "facebook", label: facebook!.trim(), href: facebookUrl });

  if (!links.length) return null;

  const Row = disabled ? "div" : "a";

  return (
    <>
      <div className="label-caps">Connect online</div>
      <div style={{ height: 8 }} />
      <div style={{ border: "1px solid var(--border-subtle)", borderRadius: 12, overflow: "hidden" }}>
        {links.map((l, i) => (
          <Row
            key={l.icon}
            {...(disabled ? {} : { href: l.href, target: "_blank", rel: "noopener noreferrer" })}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              padding: "12px 14px",
              borderTop: i === 0 ? "none" : "1px solid var(--border-subtle)",
              textDecoration: "none",
              color: "var(--text-primary)",
            }}
          >
            <span style={{ color: "var(--text-secondary)", flexShrink: 0, display: "flex" }}>
              <Icon name={l.icon} size={18} />
            </span>
            <span className="body-s" style={{ flex: 1, minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {l.label}
            </span>
          </Row>
        ))}
      </div>
    </>
  );
}
