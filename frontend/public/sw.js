self.addEventListener('push', (event) => {
  let payload = {};
  try { payload = event.data ? event.data.json() : {}; } catch { payload = { body: event.data ? event.data.text() : '' }; }

  const scopePath = new URL(self.registration.scope).pathname.replace(/\/$/, '');
  const title = payload.title || 'Maintenance Operations';
  const options = {
    body: payload.body || 'You have a new maintenance notification.',
    tag: payload.tag || `maintenance-${payload.id || Date.now()}`,
    data: { url: payload.url || (payload.relatedTicketId ? `${scopePath}/tickets/${payload.relatedTicketId}` : `${scopePath}/notifications`) },
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const scopePath = new URL(self.registration.scope).pathname.replace(/\/$/, '');
  const target = new URL(event.notification.data?.url || `${scopePath}/notifications`, self.location.origin).href;
  event.waitUntil(clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windows) => {
    const existing = windows.find((window) => window.url.startsWith(self.location.origin));
    if (existing) { existing.focus(); return existing.navigate(target); }
    return clients.openWindow(target);
  }));
});
