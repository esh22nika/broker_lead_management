// Use the server session cookie and a CSRF token for every state-changing request.
export async function apiFetch(url, options = {}) {
  const headers = new Headers(options.headers);
  const method = (options.method || "GET").toUpperCase();
  if (!["GET", "HEAD", "OPTIONS"].includes(method)) {
    const response = await fetch("/api/v1/auth/csrf", { credentials: "same-origin" });
    if (!response.ok) throw new Error("Unable to verify your session. Please try again.");
    const csrf = await response.json();
    headers.set(csrf.headerName, csrf.token);
  }
  const response = await fetch(url, { ...options, headers, credentials: "same-origin" });
  if (response.status === 401 && !["/api/v1/auth/login", "/api/v1/auth/me"].includes(url)) {
    window.dispatchEvent(new Event("blms-session-expired"));
  }
  return response;
}

export async function responseError(response, fallback) {
  const body = await response.json().catch(() => ({}));
  return new Error(body.error || body.message || `${fallback} (${response.status})`);
}
