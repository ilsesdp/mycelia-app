import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/types/database";

type Client = SupabaseClient<Database>;

// Push subscription state lives in the browser (service worker + Push API),
// not in any server prop, so every function here reads/writes it live
// rather than being passed initial values from the server.

export function isPushSupported(): boolean {
  return typeof window !== "undefined" && "serviceWorker" in navigator && "PushManager" in window;
}

// Converts the VAPID public key from its base64url form (what
// NEXT_PUBLIC_VAPID_PUBLIC_KEY holds, and what `npx web-push
// generate-vapid-keys` prints) into the Uint8Array pushManager.subscribe()
// needs as applicationServerKey.
function urlBase64ToUint8Array(base64String: string): Uint8Array<ArrayBuffer> {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(new ArrayBuffer(rawData.length));
  for (let i = 0; i < rawData.length; i++) outputArray[i] = rawData.charCodeAt(i);
  return outputArray;
}

export async function getCurrentPushSubscription(): Promise<PushSubscription | null> {
  if (!isPushSupported()) return null;
  const reg = await navigator.serviceWorker.getRegistration("/sw.js");
  if (!reg) return null;
  return reg.pushManager.getSubscription();
}

// Registers the service worker (idempotent — re-registering an identical
// script is a no-op), asks for notification permission, subscribes, and
// upserts the subscription row so send-push-notification can find it.
// Throws if the visitor declines the permission prompt or the browser
// blocks it — callers show that as a failed toggle, not a silent no-op.
export async function enablePush(supabase: Client, userId: string): Promise<void> {
  if (!isPushSupported()) throw new Error("Push notifications aren't supported in this browser.");

  const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
  if (!vapidPublicKey) throw new Error("Push notifications aren't configured yet.");

  const permission = await Notification.requestPermission();
  if (permission !== "granted") throw new Error("Notification permission was not granted.");

  const reg = await navigator.serviceWorker.register("/sw.js");
  await navigator.serviceWorker.ready;

  const existing = await reg.pushManager.getSubscription();
  const sub =
    existing ??
    (await reg.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(vapidPublicKey),
    }));

  const key = sub.getKey("p256dh");
  const auth = sub.getKey("auth");
  if (!key || !auth) throw new Error("Couldn't read the new subscription's keys.");

  const toBase64Url = (buf: ArrayBuffer) => btoa(String.fromCharCode(...new Uint8Array(buf))).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");

  await supabase.from("push_subscriptions").upsert(
    {
      user_id: userId,
      endpoint: sub.endpoint,
      p256dh: toBase64Url(key),
      auth_key: toBase64Url(auth),
    },
    { onConflict: "endpoint" }
  );
}

// Unsubscribes this browser and removes its row — the reverse of
// enablePush. Safe to call even if nothing is currently subscribed.
export async function disablePush(supabase: Client): Promise<void> {
  const sub = await getCurrentPushSubscription();
  if (!sub) return;
  await supabase.from("push_subscriptions").delete().eq("endpoint", sub.endpoint);
  await sub.unsubscribe();
}
