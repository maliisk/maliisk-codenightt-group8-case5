const BASE = "http://localhost:8080";

export async function postJson(url, body) {
  const res = await fetch(BASE + url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json().catch(() => ({}));
}

export async function getJson(url) {
  const res = await fetch(BASE + url);
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}
