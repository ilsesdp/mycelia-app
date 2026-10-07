import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getThreadMessages } from "@/lib/messages";
import { ThreadView } from "@/components/messages/ThreadView";

// Ports SCREENS['3.3'] for an existing thread. RLS (message_threads_select)
// already restricts this to the thread's two parties — the visitor who
// started it or the farm's owner — so a maybeSingle() miss here means
// either the thread doesn't exist or this visitor isn't part of it, and
// both cases should look like a 404 rather than leaking which.
export default async function ThreadPage({ params }: PageProps<"/messages/[threadId]">) {
  const { threadId } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/welcome");

  const { data: thread } = await supabase
    .from("message_threads")
    .select("id, farm_id, counterpart_id, farms ( name, owner_id )")
    .eq("id", threadId)
    .maybeSingle();

  if (!thread) notFound();

  const amOwner = thread.farms?.owner_id === user.id;
  // See lib/messages.ts's getMyThreads for why this reads
  // profile_display_names rather than embedding profiles directly —
  // profiles RLS blocks that embed for anyone but the row's own owner.
  const { data: counterpart } = await supabase.from("profile_display_names").select("contact_name, full_name").eq("id", thread.counterpart_id).maybeSingle();
  const title = amOwner ? counterpart?.contact_name || counterpart?.full_name || "A visitor" : thread.farms?.name || "A farm";

  const messages = await getThreadMessages(supabase, thread.id);

  return (
    <ThreadView
      myId={user.id}
      threadId={thread.id}
      farmId={thread.farm_id}
      title={title}
      initialMessages={messages}
      backHref="/messages"
    />
  );
}
