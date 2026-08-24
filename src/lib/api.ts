import supabase from './supabase';

export async function authHeaders(): Promise<HeadersInit> {
  let session = (await supabase.auth.getSession()).data.session;
  
  // If session token is missing or near expiry, try refreshing session
  if (!session || (session.expires_at && session.expires_at * 1000 < Date.now() + 60000)) {
    try {
      const { data } = await supabase.auth.refreshSession();
      if (data.session) session = data.session;
    } catch { /* ignore refresh error */ }
  }

  let token = session?.access_token;
  
  // Fallback: if no active Supabase auth session token, check cached user profile ID
  if (!token) {
    try {
      const stored = localStorage.getItem('agarly_user_profile');
      if (stored) {
        const p = JSON.parse(stored);
        if (p.id) token = p.id;
      }
    } catch { /* ignore */ }
  }

  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

export async function apiGet<T = unknown>(path: string): Promise<T> {
  const res = await fetch(path, { headers: await authHeaders() });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error || 'Request failed');
  }
  return res.json();
}

export async function apiSend<T = unknown>(
  path: string,
  method: string,
  body?: unknown
): Promise<T> {
  const res = await fetch(path, {
    method,
    headers: await authHeaders(),
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error || 'Request failed');
  }
  return res.json();
}

export function formatPrice(n: number) {
  return new Intl.NumberFormat('en-EG', {
    style: 'currency',
    currency: 'EGP',
    maximumFractionDigits: 0,
  }).format(n);
}

export function listingTypeLabel(t: string) {
  const map: Record<string, string> = {
    entire_apartment: 'Entire Apartment',
    private_room: 'Private Room',
    shared_bed: 'Bed Rental',
  };
  return map[t] || t;
}
