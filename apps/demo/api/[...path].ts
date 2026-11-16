import type { IncomingMessage, ServerResponse } from "http";

export default async function handler(req: IncomingMessage & { query?: Record<string, string | string[]>; body?: any }, res: ServerResponse) {
  const backendBase = process.env.TRANSCRIPT_API_URL || "http://localhost:8000";
  
  // Extract path from request URL or query
  const rawUrl = req.url || "";
  const cleanPath = rawUrl.replace(/^\/api\/?/, "");
  const targetUrl = new URL(cleanPath, backendBase.endsWith("/") ? backendBase : `${backendBase}/`);

  try {
    const upstreamRes = await fetch(targetUrl.toString(), {
      method: req.method || "GET",
      headers: {
        "Content-Type": (req.headers["content-type"] as string) || "application/json",
      },
      body: ["POST", "PUT", "PATCH"].includes(req.method || "") && req.body ? JSON.stringify(req.body) : undefined,
    });

    const responseBody = await upstreamRes.text();
    res.statusCode = upstreamRes.status;
    res.setHeader("Content-Type", upstreamRes.headers.get("Content-Type") || "application/json");
    res.end(responseBody);
  } catch (error) {
    res.statusCode = 502;
    res.setHeader("Content-Type", "application/json");
    res.end(JSON.stringify({
      error: "Bad Gateway",
      message: "Failed to connect to internal transcript-api service via TRANSCRIPT_API_URL binding",
      target: targetUrl.toString(),
      details: String(error),
    }));
  }
}
