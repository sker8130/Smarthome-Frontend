function parseJwt(token: string) {
  try {
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );
    return JSON.parse(jsonPayload);
  } catch {
    return null;
  }
}

export function getAuthToken() {
  return (
    localStorage.getItem("token") || sessionStorage.getItem("token") || ""
  );
}


export function isTokenValid(): boolean {
  const token = getAuthToken();
  if (!token) return false;

  const decoded = parseJwt(token);
  if (!decoded || !decoded.exp) return false;

  const now = Math.floor(Date.now() / 1000);
  if (decoded.exp < now) {
    handleUnauthorized();
    return false;
  }

  return true;
}

export async function apiFetch(path: string, options: RequestInit = {}) {
  const token = getAuthToken();

  if (!isTokenValid()) {
    throw new Error("Token expired");
  }

  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Authorization: token ? `Bearer ${token}` : "",
      ...(options.headers || {}),
    },
  });

  if (res.status === 401) {
    handleUnauthorized();
    throw new Error("Unauthorized");
  }

  if (res.status === 204) return null;
  const data = await res.json().catch(() => null);
  if (!res.ok) {
    const msg = (data && data.message) || res.statusText || "API Error";
    throw new Error(msg);
  }
  return data;
}

function handleUnauthorized() {
  localStorage.removeItem("token");
  sessionStorage.removeItem("token");
  if (typeof window !== "undefined") {
    window.location.href = "/login";
  }
}