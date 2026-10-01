import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { findThreadForFarm, getThreadMessages } from "@/lib/messages";
import { ThreadView } from "@/components/messages/ThreadView";

// Entry point for a farm profile's "Message" button/corner (MessageAction).
// Finds the existing thread between this visitor and this farm, if the
// first message has already been sent, and shows it; otherwise renders a
// fresh composer with no thread yet — sending from there is what actually
// creates the message_threads row (ThreadView), same as the prototype's
// "first message creates the thread" behavior.
export default async function MessageFarmPage({ params }: PageProps<"/messages/farm/[farmId]">) {
  const { farmId } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/welcome");

  const { data: farm } = await supabase.from("farms").select("id, name").eq("id", farmId).eq("published", true).maybeSingle();
  if (!farm) notFound();

  const threadId = await findThreadForFarm(supabase, farmId, user.id);
  const initialMessages = threadId ? await getThreadMessages(supabase, threadId) : [];

  return (
    <ThreadView
      myId={user.id}
      threadId={threadId}
      farmId={farm.id}
      title={farm.name}
      initialMessages={initialMessages}
      backHref={`/farms/${farm.id}/about`}
    />
  );
}
