import { proxyToNewsletterApi } from "../_lib/proxy";

export async function POST(request: Request) {
  return proxyToNewsletterApi("/articles", request);
}
