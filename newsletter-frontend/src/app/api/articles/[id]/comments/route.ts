import { proxyToNewsletterApi } from "../../../_lib/proxy";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_request: Request, context: RouteContext) {
  const { id } = await context.params;
  return proxyToNewsletterApi(`/articles/${encodeURIComponent(id)}/comments`);
}

export async function POST(request: Request, context: RouteContext) {
  const { id } = await context.params;
  return proxyToNewsletterApi(`/articles/${encodeURIComponent(id)}/comments`, request);
}
