import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { canStartThread, findThreadForFarm, getThreadMessages } from "@/lib/messages";
import { ThreadView } from "@/components/messages/ThreadView";

// Entry point for a farm profile's "Message" button/corner (MessageAction).
// Finds the existing thread between this visitor and this farm, if the
// first message has already been sent, and shows it; otherwise renders a
// fresh composer with no thread yet — sending from there is what actually
// creates the message_threads row (ThreadView), same as the prototype's
// "first message creates the thread" behavior. For a farm whose owner has
// turned "Who can message you" to Growers only or Only me (Privacy &
// visibility), canStartThread checks the same rule the message_threads
// insert RLS policy enforces, so a visitor who can't start one sees why
// up front rather than a composer whose first send silently fails.
export default async function MessageFarmPage({ params }: PageProps<"/messages/farm/[farmId]">) {
  const { farmId } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/welcome");

  const { data: farm } = await supabase.from("farms").select("id, name, owner_id").eq("id", farmId).eq("published", true).maybeSingle();
  if (!farm) notFound();

  const threadId = await findThreadForFarm(supabase, farmId, user.id);
  const initialMessages = threadId ? await getThreadMessages(supabase, threadId) : [];
  const threadStartCheck = threadId ? "allowed" : await canStartThread(supabase, farm.owner_id, user.id);

  return (
    <ThreadView
      myId={user.id}
      threadId={threadId}
      farmId={farm.id}
      title={farm.name}
      initialMessages={initialMessages}
      backHref={`/farms/${farm.id}/about`}
      threadStartCheck={threadStartCheck}
    />
  );
}
