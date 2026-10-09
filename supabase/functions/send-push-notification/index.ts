import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";
import webpush from "npm:web-push@3.6.7";

// Fires on every new row in public.messages, alongside send-sms-notification
// (see the messages_notify_sms trigger / notify_new_message() function in
// the database). Not user-facing -- pg_net calls this directly, so it's
// protected by a shared secret header instead of a user JWT (verify_jwt is
// off for this function, same as the SMS one).
//
// Required secrets (set via the Supabase Dashboard -> Edge Functions ->
// send-push-notification -> Secrets -- never in git or chat):
//   WEBHOOK_SECRET        - must match the same value stored in Supabase
//                           Vault under the name 'webhook_secret'.
//   VAPID_PUBLIC_KEY       - the same value as NEXT_PUBLIC_VAPID_PUBLIC_KEY
//                           in the Next.js app's env.
//   VAPID_PRIVATE_KEY      - pairs with the public key above. Keep this one
//                           server-side only, never in NEXT_PUBLIC_*.
//   VAPID_SUBJECT          - a mailto: or https: URL identifying the sender,
//                           required by the Web Push protocol (e.g.
//                           'mailto:you@example.com').
//
// SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY are provided automatically by the
// Edge Functions runtime -- nothing to configure for those.
//
// Until all of the above are set, this function safely no-ops (the trigger
// skips calling it at all until the vault secret exists, and this function
// itself returns early if its own secrets are missing) -- same end-user
// experience as today, just no push sent yet.
Deno.serve(async (req: Request) => {
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  const webhookSecret = Deno.env.get("WEBHOOK_SECRET");
  if (!webhookSecret || req.headers.get("x-webhook-secret") !== webhookSecret) {
    return new Response("Unauthorized", { status: 401 });
  }

  let payload: { thread_id?: string; sender_id?: string; body?: string };
  try {
    payload = await req.json();
  } catch {
    return new Response("Bad request", { status: 400 });
  }
  const { thread_id, sender_id } = payload;
  if (!thread_id || !sender_id) {
    return new Response("Bad request", { status: 400 });
  }

  const supabase = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);

  const { data: thread } = await supabase.from("message_threads").select("farm_id, counterpart_id").eq("id", thread_id).single();
  if (!thread) return new Response("Thread not found", { status: 200 });

  const { data: farm } = await supabase.from("farms").select("owner_id, name").eq("id", thread.farm_id).single();
  if (!farm) return new Response("Farm not found", { status: 200 });

  // The message's recipient is whichever side of the thread didn't send it --
  // same resolution the SMS function uses.
  const recipientId = sender_id === thread.counterpart_id ? farm.owner_id : thread.counterpart_id;
  if (!recipientId || recipientId === sender_id) {
    return new Response("No recipient", { status: 200 });
  }

  const { data: recipient } = await supabase
    .from("profiles")
    .select("notif_msg_on, notif_pause")
    .eq("id", recipientId)
    .single();

  if (!recipient || recipient.notif_pause || !recipient.notif_msg_on) {
    return new Response("Skipped -- recipient not eligible for push", { status: 200 });
  }

  const { data: subs } = await supabase
    .from("push_subscriptions")
    .select("id, endpoint, p256dh, auth_key")
    .eq("user_id", recipientId);

  if (!subs || subs.length === 0) {
    return new Response("Skipped -- no push subscriptions", { status: 200 });
  }

  // Resolve the SENDER's display name. Both sides resolve to a PERSON's own
  // name now (profiles.contact_name -- the farm's own "Who to ask for"
  // field for an owner, same column a visitor fills in for themselves) --
  // not the farm's name, which is what the inbox list uses to label a
  // *thread*, a different, farm-identifying purpose.
  const { data: senderProfile } = await supabase
    .from("profiles")
    .select("contact_name, full_name")
    .eq("id", sender_id)
    .single();
  const senderName = senderProfile?.contact_name || senderProfile?.full_name || (sender_id === farm.owner_id ? farm.name : null) || "Someone";

  const vapidPublicKey = Deno.env.get("VAPID_PUBLIC_KEY");
  const vapidPrivateKey = Deno.env.get("VAPID_PRIVATE_KEY");
  const vapidSubject = Deno.env.get("VAPID_SUBJECT");
  if (!vapidPublicKey || !vapidPrivateKey || !vapidSubject) {
    console.error("VAPID credentials not configured -- set VAPID_PUBLIC_KEY / VAPID_PRIVATE_KEY / VAPID_SUBJECT");
    return new Response("Push not configured", { status: 200 });
  }
  webpush.setVapidDetails(vapidSubject, vapidPublicKey, vapidPrivateKey);

  // Deliberately generic -- never the message body -- per spec: "The push
  // alert can say 'You have a new message' for privacy", with the sender's
  // name included per the chosen option.
  const notificationPayload = JSON.stringify({
    title: `${senderName} sent you a message`,
    body: "Tap to open the conversation.",
    url: `/messages/${thread_id}`,
  });

  let sent = 0;
  for (const sub of subs) {
    try {
      await webpush.sendNotification(
        { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth_key } },
        notificationPayload,
      );
      sent++;
    } catch (err) {
      const statusCode = (err as { statusCode?: number })?.statusCode;
      if (statusCode === 404 || statusCode === 410) {
        // Subscription is gone (uninstalled, expired, etc.) -- clean it up.
        await supabase.from("push_subscriptions").delete().eq("id", sub.id);
      } else {
        console.error("Push send failed", statusCode, err);
      }
    }
  }

  await supabase.from("notification_log").insert({
    user_id: recipientId,
    channel: "push",
    event_type: "new_message_push",
    payload: { thread_id, sent, attempted: subs.length },
  });

  return new Response(`Sent ${sent}/${subs.length}`, { status: 200 });
});
