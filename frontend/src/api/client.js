const DEFAULT_BASE_URL = "http://localhost:5000";

export const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || DEFAULT_BASE_URL;

export async function apiRequest(path, { method = "GET", body, headers } = {}) {
  const url = `${apiBaseUrl}${path}`;

  const res = await fetch(url, {
    method,
    headers: {
      ...(body ? { "Content-Type": "application/json" } : {}),
      ...(headers || {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  const text = await res.text();
  const contentType = res.headers.get("content-type") || "";
  const isJson = contentType.includes("application/json");
  const data = isJson && text ? JSON.parse(text) : text;

  if (!res.ok) {
    const msg = typeof data === "object" && data?.error ? data.error : `Request failed (${res.status})`;
    const err = new Error(msg);
    err.status = res.status;
    err.data = data;
    throw err;
  }

  return data;
}

