const TOKEN_KEY = 'entuned_admin_token';

const getAuthEndpoint = (): string => {
  const endpoint = import.meta.env.VITE_AUTH_ENDPOINT;
  if (endpoint) return endpoint;

  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
  return `${supabaseUrl}/functions/v1/admin-auth`;
};

export async function login(
  password: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const response = await fetch(getAuthEndpoint(), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password }),
    });

    if (!response.ok) {
      const body = await response.json().catch(() => ({}));
      return {
        success: false,
        error: body.error || `Authentication failed (${response.status})`,
      };
    }

    const { token } = await response.json();
    if (!token) {
      return { success: false, error: 'No token returned from server' };
    }

    localStorage.setItem(TOKEN_KEY, token);
    return { success: true };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Unknown error',
    };
  }
}

export function logout(): void {
  localStorage.removeItem(TOKEN_KEY);
}

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function isAuthenticated(): boolean {
  const token = getToken();
  if (!token) return false;

  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    const now = Math.floor(Date.now() / 1000);
    return typeof payload.exp === 'number' && payload.exp > now;
  } catch {
    return false;
  }
}
