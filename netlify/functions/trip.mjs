// Netlify Function (v2) — stores each trip as one JSON blob, keyed by trip code.
// Routes: GET/PUT/POST/DELETE /api/trip?code=ABC-D2F
import { getStore } from "@netlify/blobs";

const json = (obj, status = 200) =>
  new Response(JSON.stringify(obj), {
    status,
    headers: { "content-type": "application/json", "cache-control": "no-store" },
  });

export default async (req) => {
  const url = new URL(req.url);
  const code = (url.searchParams.get("code") || "").trim().toUpperCase();

  // Validate the trip code so the key space stays clean and safe.
  if (!code || code.length > 32 || !/^[A-Z0-9-]+$/.test(code)) {
    return json({ error: "Missing or invalid trip code." }, 400);
  }

  const store = getStore("trips");
  const key = `trip:${code}`;

  try {
    if (req.method === "GET") {
      const data = await store.get(key, { type: "json" });
      return json({ data: data ?? null });
    }

    if (req.method === "PUT" || req.method === "POST") {
      const body = await req.json();
      await store.setJSON(key, body);
      return json({ ok: true });
    }

    if (req.method === "DELETE") {
      await store.delete(key);
      return json({ ok: true });
    }

    return json({ error: "Method not allowed." }, 405);
  } catch (err) {
    return json({ error: "Storage error.", detail: String(err) }, 500);
  }
};

export const config = { path: "/api/trip" };
