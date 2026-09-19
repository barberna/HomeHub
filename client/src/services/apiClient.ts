import { appConfig } from '../config/appConfig';
/**
 * BACKEND INTEGRATION: This is the one low-level `fetch` helper for future service adapters.
 * Visual components should never call it directly. Keeping HTTP details here gives every request
 * the same base URL, JSON headers, cookie behavior, and safe user-facing error handling.
 */
export async function apiRequest<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${appConfig.apiBaseUrl}${path}`, {
    ...init,
    headers: { 'Content-Type': 'application/json', ...init?.headers },
    // `include` lets the browser send a future secure, HTTP-only session cookie. JavaScript does
    // not need—and should not be allowed—to read that cookie or store a bearer token itself.
    credentials: 'include',
  });
  if (!response.ok) {
    // Later, translate the backend's stable error code into a useful message without exposing
    // stack traces, internal addresses, credentials, or raw third-party service responses.
    throw new Error('HomeHub could not complete that request.');
  }
  // T is the normalized response type promised by the calling service adapter.
  return response.json() as Promise<T>;
}
