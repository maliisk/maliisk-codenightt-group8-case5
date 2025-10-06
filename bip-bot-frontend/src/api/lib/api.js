const API = import.meta.env.VITE_API_URL || "http://localhost:8080";

async function get(path) {
  const res = await fetch(`${API}${path}`);
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}
async function post(path, body = {}) {
  const res = await fetch(`${API}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(await res.text());
  try {
    return await res.json();
  } catch {
    return {};
  }
}

export { API, get, post };
