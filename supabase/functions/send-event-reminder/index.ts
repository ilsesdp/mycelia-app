import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";
import webpush from "npm:web-push@3.6.7";

// Fires once a day per upcoming event, called by the notify_tomorrow_events()
// Postgres function via pg_cron + pg_net (see that function's comment in the
// migration for the schedule and the date_mode handling). Not user-facing --
// pg_net calls this directly, so it's protected by the same shared secret
// header as send-push-notification, with verify_jwt off to match.
//
// Secrets: Supabase Edge Function secrets are project-wide, so the same
// WEBHOOK_SECRET / VAPID_PUBLIC_KEY / VAPID_PRIVATE_KEY / VAPID_SUBJECT
// already set for send-push-notification are automatically available here
// too -- nothing new to configure in the dashboard.
//
// SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY are provided automatically.
//
// Until the VAPID secrets are set, this safely no-ops, same as send-push-notification.
Deno.serve(async (req: Request) => {
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  const webhookSecret = Deno.env.get("WEBHOOK_SECRET");
  if (!webhookSecret || req.headers.get("x-webhook-secret") !== webhookSecret) {
    return new Response("Unauthorized", { status: 401 });
  }

  let payload: { event_id?: string; farm_id?: string; event_name?: string; event_date?: string };
  try {
    payload = await req.json();
  } catch {
    return new Response("Bad request", { status: 400 });
  }
  const { event_id, farm_id, event_name } = payload;
  if (!event_id || !farm_id) {
    return new Response("Bad request", { status: 400 });
  }

  const supabase = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);

  const { data: farm } = await supabase.from("farms").select("owner_id, name").eq("id", farm_id).single();
  if (!farm?.owner_id) return new Response("Farm not found", { status: 200 });

  const { data: owner } = await supabase
    .from("profiles")
    .select("notif_event_on, notif_pause")
    .eq("id", farm.owner_id)
    .single();

  if (!owner || owner.notif_pause || !owner.notif_event_on) {
    return new Response("Skipped -- owner not eligible for push", { status: 200 });
  }

  const { data: subs } = await supabase
    .from("push_subscriptions")
    .select("id, endpoint, p256dh, auth_key")
    .eq("user_id", farm.owner_id);

  if (!subs || subs.length === 0) {
    return new Response("Skipped -- no push subscriptions", { status: 200 });
  }

  const vapidPublicKey = Deno.env.get("VAPID_PUBLIC_KEY");
  const vapidPrivateKey = Deno.env.get("VAPID_PRIVATE_KEY");
  const vapidSubject = Deno.env.get("VAPID_SUBJECT");
  if (!vapidPublicKey || !vapidPrivateKey || !vapidSubject) {
    console.error("VAPID credentials not configured -- set VAPID_PUBLIC_KEY / VAPID_PRIVATE_KEY / VAPID_SUBJECT");
    return new Response("Push not configured", { status: 200 });
  }
  webpush.setVapidDetails(vapidSubject, vapidPublicKey, vapidPrivateKey);

  const notificationPayload = JSON.stringify({
    title: `${event_name || "Your event"} is tomorrow`,
    body: "Tap to view the details.",
    url: `/my-farm/events/${event_id}`,
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
        await supabase.from("push_subscriptions").delete().eq("id", sub.id);
      } else {
        console.error("Push send failed", statusCode, err);
      }
    }
  }

  await supabase.from("notification_log").insert({
    user_id: farm.owner_id,
    channel: "push",
    event_type: "event_reminder_push",
    payload: { event_id, sent, attempted: subs.length },
  });

  return new Response(`Sent ${sent}/${subs.length}`, { status: 200 });
});
