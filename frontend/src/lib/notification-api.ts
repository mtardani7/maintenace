import { apiRequest, ApiConfigurationError, ApiError } from './api';
import type { AppNotification, NotificationPage } from './notification-types';

const paths = {
  list: process.env.NEXT_PUBLIC_NOTIFICATIONS_PATH,
  unreadCount: process.env.NEXT_PUBLIC_NOTIFICATIONS_UNREAD_COUNT_PATH,
  read: process.env.NEXT_PUBLIC_NOTIFICATION_READ_PATH_TEMPLATE,
  readAll: process.env.NEXT_PUBLIC_NOTIFICATIONS_READ_ALL_PATH,
  subscribe: process.env.NEXT_PUBLIC_PUSH_SUBSCRIPTION_PATH,
  publicKey: process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
};

type NotificationResponse = AppNotification[] | { data: AppNotification[]; meta?: { current_page?: number; last_page?: number; unread_count?: number }; unread_count?: number };

function requiredPath(value: string | undefined, label: string) {
  if (!value) throw new ApiConfigurationError(`${label} endpoint is not configured yet.`);
  return value;
}

function normalize(response: NotificationResponse): NotificationPage {
  if (Array.isArray(response)) return { data: response, unreadCount: response.filter((item) => !item.read).length, currentPage: 1, lastPage: 1 };
  return { data: response.data, unreadCount: response.unread_count ?? response.meta?.unread_count ?? response.data.filter((item) => !item.read).length, currentPage: response.meta?.current_page ?? 1, lastPage: response.meta?.last_page ?? 1 };
}

export async function getNotifications(page = 1): Promise<NotificationPage> {
  const path = requiredPath(paths.list, 'Notification list');
  return normalize(await apiRequest<NotificationResponse>(`${path}${path.includes('?') ? '&' : '?'}page=${page}`));
}

export async function getUnreadNotificationCount() {
  if (!paths.unreadCount) return 0;
  const response = await apiRequest<{ count: number }>(paths.unreadCount);
  return response.count;
}

export async function markNotificationRead(id: AppNotification['id']) {
  return apiRequest<AppNotification>(requiredPath(paths.read, 'Mark notification read').replace('{id}', encodeURIComponent(String(id))), { method: 'PATCH' });
}

export async function markAllNotificationsRead() {
  return apiRequest<void>(requiredPath(paths.readAll, 'Mark all notifications read'), { method: 'POST' });
}

export function notificationApiMessage(error: unknown) {
  if (error instanceof ApiError) {
    if (error.status === 401) return 'Your session has expired. Sign in again to continue.';
    if (error.status === 403) return 'You do not have permission to manage notifications.';
    if (error.status === 404) return 'The notification could not be found.';
    if (error.status === 422) return error.message || 'The notification request was not valid.';
    if (error.status >= 500) return 'The notification service is having trouble. Try again shortly.';
  }
  if (error instanceof ApiConfigurationError) return error.message;
  if (error instanceof TypeError) return 'The notification service could not be reached. Check your connection.';
  return 'The notification request could not be completed.';
}

function urlBase64ToUint8Array(value: string) {
  const padding = '='.repeat((4 - (value.length % 4)) % 4);
  const base64 = (value + padding).replace(/-/g, '+').replace(/_/g, '/');
  const raw = window.atob(base64);
  return Uint8Array.from([...raw].map((character) => character.charCodeAt(0)));
}

export async function subscribePush(registration: ServiceWorkerRegistration) {
  if (!paths.publicKey) throw new ApiConfigurationError('Public VAPID key is not configured yet.');
  if (!paths.subscribe) throw new ApiConfigurationError('Push subscription endpoint is not configured yet.');
  const existing = await registration.pushManager.getSubscription();
  const subscription = existing ?? await registration.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: urlBase64ToUint8Array(paths.publicKey) });
  await apiRequest(paths.subscribe, { method: 'POST', body: JSON.stringify(subscription.toJSON()) });
}
