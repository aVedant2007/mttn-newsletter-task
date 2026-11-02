const API_BASE =
  process.env.NEWSLETTER_API_URL ??
  process.env.NEXT_PUBLIC_API_URL ??
  "http://localhost:8080";

export async function proxyToNewsletterApi(path: string, request?: Request) {
  try {
    const body = request && request.method !== "GET" ? await request.text() : undefined;
    const upstream = await fetch(`${API_BASE}${path}`, {
      method: request?.method ?? "GET",
      headers: body ? { "Content-Type": request?.headers.get("content-type") ?? "application/json" } : undefined,
      body,
      cache: "no-store",
    });
    return new Response(upstream.body, {
      status: upstream.status,
      headers: { "Content-Type": upstream.headers.get("content-type") ?? "application/json" },
    });
  } catch {
    return Response.json({ error: "Newsletter service is unavailable." }, { status: 503 });
  }
}
