import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getMyFarmId } from "@/lib/myFarm";
import { EventForm } from "@/components/myfarm/EventForm";

// Ports SCREENS['4.16'] in add mode, opened from 4.9 or 4.21.
export default async function AddEventPage({ searchParams }: PageProps<"/my-farm/events/new">) {
  const sp = await searchParams;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/welcome");

  const farmId = await getMyFarmId(supabase, user.id);
  if (!farmId) redirect("/settings");

  return <EventForm farmId={farmId} event={null} photos={[]} backTo={typeof sp.backTo === "string" ? sp.backTo : "events"} />;
}
