const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

class ApiClient {
  private getToken(): string | null {
    // 1. Scan localStorage for any sb-*-auth-token key created by Supabase
    try {
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('sb-') && key.endsWith('-auth-token')) {
          const session = localStorage.getItem(key);
          if (session) {
            const parsed = JSON.parse(session);
            if (parsed?.access_token) {
              return parsed.access_token;
            }
          }
        }
      }
    } catch {
      // ignore
    }

    // 2. Direct key calculation fallback
    try {
      const host = import.meta.env.VITE_SUPABASE_URL?.split('//')[1]?.split('.')[0];
      const storageKey = `sb-${host}-auth-token`;
      const session = localStorage.getItem(storageKey);
      if (session) {
        const parsed = JSON.parse(session);
        return parsed?.access_token || null;
      }
    } catch {
      // ignore
    }

    return null;
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const token = this.getToken();
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...((options.headers as Record<string, string>) || {}),
    };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    const response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers,
    });
    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Request failed' }));
      throw new Error(error.error || 'Request failed');
    }
    
    const json = await response.json();
    // Auto-unwrap `{ data: ... }` if backend wrapped payload in data property
    if (json && typeof json === 'object' && 'data' in json) {
      return json.data as T;
    }
    return json as T;
  }

  get<T>(endpoint: string) { return this.request<T>(endpoint); }
  post<T>(endpoint: string, data: unknown) { return this.request<T>(endpoint, { method: 'POST', body: JSON.stringify(data) }); }
  put<T>(endpoint: string, data: unknown) { return this.request<T>(endpoint, { method: 'PUT', body: JSON.stringify(data) }); }
  delete<T>(endpoint: string) { return this.request<T>(endpoint, { method: 'DELETE' }); }
}

export const api = new ApiClient();
