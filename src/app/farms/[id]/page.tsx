import { redirect } from "next/navigation";

// A bare /farms/[id] has no prototype screen of its own — "See the farm" /
// a farm card always lands on the Products tab (2.3) first, same as every
// link into this group already points at a specific tab.
export default async function FarmProfilePage({ params, searchParams }: PageProps<"/farms/[id]">) {
  const { id } = await params;
  const sp = await searchParams;
  const from = typeof sp.from === "string" ? `?from=${sp.from}` : "";
  redirect(`/farms/${id}/products${from}`);
}
