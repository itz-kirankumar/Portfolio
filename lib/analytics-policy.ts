// Shared, deliberately narrow analytics vocabulary. Never accept form values.
export const EVENT_NAMES = ['page_view', 'project_view', 'article_view', 'service_view', 'booking_view', 'project_click', 'source_click', 'resume_download', 'contact_click', 'outbound_click', 'reading_depth', 'engaged_time', 'newsletter_submit', 'newsletter_subscribed', 'booking_submit', 'chat_open'] as const
export type EventName = typeof EVENT_NAMES[number]
export function privatePath(path: string) {
  return /^\/(admin|login|preview|api|unsubscribe)(\/|$)/.test(path) || /\/book\/(.+\/checkout|success)(\/|$)/.test(path)
}
export function cleanPath(path: string) {
  return privatePath(path) ? '' : path.split(/[?#]/)[0].slice(0, 220)
}
