import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/types/database";

type Client = SupabaseClient<Database>;

// Push subscription state lives in the browser (service worker + Push API),
// not in any server prop, so every function here reads/writes it live
// rather than being passed initial values from the server.

export function isPushSupported(): boolean {
  return typeof window !== "undefined" && "serviceWorker" in navigator && "PushManager" in window && "Notification" in window;
}

// Some mobile browsers (notably iOS Safari outside of an installed,
// Home-Screen app) report serviceWorker/PushManager support but then hang
// indefinitely on requestPermission()/subscribe() instead of resolving or
// rejecting — isPushSupported() alone can't catch that in advance, so every
// step below is wrapped in this timeout instead of awaited bare. Without
// it, the toggle gets stuck mid-click forever (ToggleRow's disabled/greyed
// look with no error shown), rather than failing visibly.
function withTimeout<T>(promise: Promise<T>, ms: number, message: string): Promise<T> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error(message)), ms);
    promise.then(
      (v) => {
        clearTimeout(timer);
        resolve(v);
      },
      (e) => {
        clearTimeout(timer);
        reject(e);
      }
    );
  });
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
  const reg = await withTimeout(navigator.serviceWorker.getRegistration("/sw.js"), 15000, "Timed out checking push notification status.");
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

  // Blocked at the OS/browser level already — requestPermission() would
  // just re-resolve "denied" (or on some browsers hang rather than
  // re-prompt), so catch this up front with a message that tells the
  // visitor where to actually fix it, instead of a generic failure.
  if (typeof Notification !== "undefined" && Notification.permission === "denied") {
    throw new Error("Notifications are blocked for this site — enable them in your browser's site settings, then try again.");
  }

  const permission = await withTimeout(Notification.requestPermission(), 15000, "Notification permission didn't respond. Your browser may not allow push here — try again, or check your browser's notification settings for this site.");
  if (permission !== "granted") throw new Error("Notification permission was not granted.");

  const reg = await withTimeout(navigator.serviceWorker.register("/sw.js"), 15000, "Timed out setting up push notifications for this device. Please try again.");
  await withTimeout(navigator.serviceWorker.ready, 15000, "Timed out setting up push notifications for this device. Please try again.");

  const existing = await reg.pushManager.getSubscription();
  const sub =
    existing ??
    (await withTimeout(
      reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(vapidPublicKey),
      }),
      15000,
      "Timed out subscribing this device to push notifications. Please try again."
    ));

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
  const sub = await withTimeout(getCurrentPushSubscription(), 15000, "Timed out turning off push notifications. Please try again.");
  if (!sub) return;
  await supabase.from("push_subscriptions").delete().eq("endpoint", sub.endpoint);
  await withTimeout(sub.unsubscribe(), 15000, "Timed out turning off push notifications. Please try again.");
}
