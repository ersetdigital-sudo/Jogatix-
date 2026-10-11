/**
 * Thin wrapper around `fetch` for the app's JSON API routes. Non-2xx responses
 * throw an `Error` carrying the server's message, so callers can surface it
 * directly in a toast or inline message.
 */
export async function apiFetch<T>(url: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, {
    ...init,
    headers: { "Content-Type": "application/json", ...(init?.headers ?? {}) },
  });

  if (!response.ok) {
    const data = (await response.json().catch(() => null)) as { error?: string } | null;
    const error = new Error(data?.error ?? `Permintaan gagal (${response.status}).`);
    error.name = `ApiError${response.status}`;
    throw error;
  }

  return (await response.json()) as T;
}
