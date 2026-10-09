import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

// Fires on every new row in public.messages (see the
// messages_notify_sms trigger / notify_new_message() function in the
// database). Not user-facing — pg_net calls this directly, so it's
// protected by a shared secret header instead of a user JWT
// (verify_jwt is off for this function).
//
// Required secrets (set via `supabase secrets set` or the dashboard,
// Edge Functions -> send-sms-notification -> Secrets -- never in git
// or chat):
//   WEBHOOK_SECRET        - must match the same value stored in
//                           Supabase Vault under the name
//                           'webhook_secret' (see the migration).
//   TWILIO_ACCOUNT_SID
//   TWILIO_AUTH_TOKEN
//   TWILIO_FROM_NUMBER    - the Twilio number messages send from.
//
// SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY are provided automatically
// by the Edge Functions runtime -- nothing to configure for those.
//
// Until all of the above are set, this function safely no-ops (the
// trigger skips calling it at all until the vault secret exists, and
// this function itself returns early if its own secrets are missing)
// -- same end-user experience as today, just no SMS sent yet.
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
  const { thread_id, sender_id, body } = payload;
  if (!thread_id || !sender_id || !body) {
    return new Response("Bad request", { status: 400 });
  }

  const supabase = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);

  const { data: thread } = await supabase.from("message_threads").select("farm_id, counterpart_id").eq("id", thread_id).single();
  if (!thread) return new Response("Thread not found", { status: 200 });

  const { data: farm } = await supabase.from("farms").select("owner_id, name").eq("id", thread.farm_id).single();
  if (!farm) return new Response("Farm not found", { status: 200 });

  // The message's recipient is whichever side of the thread didn't send it.
  const recipientId = sender_id === thread.counterpart_id ? farm.owner_id : thread.counterpart_id;
  if (!recipientId || recipientId === sender_id) {
    return new Response("No recipient", { status: 200 });
  }

  const { data: recipient } = await supabase
    .from("profiles")
    .select("contact_phone, message_channel, notif_msg_on, notif_pause")
    .eq("id", recipientId)
    .single();

  if (
    !recipient ||
    recipient.notif_pause ||
    !recipient.notif_msg_on ||
    recipient.message_channel === "email_me" ||
    !recipient.contact_phone
  ) {
    return new Response("Skipped -- recipient not eligible for SMS", { status: 200 });
  }

  const accountSid = Deno.env.get("TWILIO_ACCOUNT_SID");
  const authToken = Deno.env.get("TWILIO_AUTH_TOKEN");
  const fromNumber = Deno.env.get("TWILIO_FROM_NUMBER");
  if (!accountSid || !authToken || !fromNumber) {
    console.error("Twilio credentials not configured -- set TWILIO_ACCOUNT_SID / TWILIO_AUTH_TOKEN / TWILIO_FROM_NUMBER");
    return new Response("Twilio not configured", { status: 200 });
  }

  const truncated = body.length > 140 ? `${body.slice(0, 137)}...` : body;
  const text = `Mycelia: new message from ${farm.name || "a grower"}: "${truncated}"`;

  const twilioRes = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${btoa(`${accountSid}:${authToken}`)}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({ To: recipient.contact_phone, From: fromNumber, Body: text }),
  });

  if (!twilioRes.ok) {
    console.error("Twilio send failed", twilioRes.status, await twilioRes.text());
    return new Response("Twilio send failed", { status: 200 });
  }

  return new Response("Sent", { status: 200 });
});
