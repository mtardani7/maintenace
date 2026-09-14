self.addEventListener('push', (event) => {
  let payload = {};
  try { payload = event.data ? event.data.json() : {}; } catch { payload = { body: event.data ? event.data.text() : '' }; }

  const title = payload.title || 'Maintenance Operations';
  const options = {
    body: payload.body || 'You have a new maintenance notification.',
    tag: payload.tag || `maintenance-${payload.id || Date.now()}`,
    data: { url: payload.url || (payload.relatedTicketId ? `/tickets/${payload.relatedTicketId}` : '/notifications') },
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const target = new URL(event.notification.data?.url || '/notifications', self.location.origin).href;
  event.waitUntil(clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windows) => {
    const existing = windows.find((window) => window.url.startsWith(self.location.origin));
    if (existing) { existing.focus(); return existing.navigate(target); }
    return clients.openWindow(target);
  }));
});
