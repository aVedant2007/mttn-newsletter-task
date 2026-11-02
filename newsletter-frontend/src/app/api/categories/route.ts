import { proxyToNewsletterApi } from "../_lib/proxy";

export async function GET() {
  return proxyToNewsletterApi("/categories");
}
