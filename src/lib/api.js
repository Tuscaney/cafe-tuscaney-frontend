const BASE = import.meta.env.VITE_API_BASE_URL; // e.g. https://6b6ni0suhd.execute-api.us-east-2.amazonaws.com

export async function getMenu() {
  const res = await fetch(`${BASE}/menu`);
  if (!res.ok) throw new Error(`Menu fetch failed: ${res.status}`);
  return res.json();
}
