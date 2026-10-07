// Web Push service worker. Registered by src/lib/push.ts when someone turns
// on "Push notifications" in Settings -> Notifications. Two jobs: show the
// notification when a push arrives, and deep-link back into the open
// conversation when it's tapped.
//
// The push payload is set by the send-push-notification Edge Function —
// see its comments for exactly what it sends and why (sender's name only,
// never the message body).

self.addEventListener("push", (event) => {
  let data = { title: "You have a new message", body: "Tap to open the conversation.", url: "/messages" };
  try {
    if (event.data) data = { ...data, ...event.data.json() };
  } catch {
    // Malformed or missing payload -- fall back to the generic text above
    // rather than dropping the notification silently.
  }

  event.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.body,
      icon: "/icons/icon-192.png",
      badge: "/icons/icon-192.png",
      data: { url: data.url },
    })
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const url = event.notification.data?.url || "/messages";

  event.waitUntil(
    (async () => {
      const clientsList = await self.clients.matchAll({ type: "window", includeUncontrolled: true });
      for (const client of clientsList) {
        const clientUrl = new URL(client.url);
        if (clientUrl.pathname === url && "focus" in client) {
          return client.focus();
        }
      }
      // No matching tab open yet -- open a new one. If the visitor is
      // signed out, the app's own auth guard on /messages/[id] redirects
      // them through sign-in before landing here, same as any other link.
      if (self.clients.openWindow) return self.clients.openWindow(url);
    })()
  );
});
