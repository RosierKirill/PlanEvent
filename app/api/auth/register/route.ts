import { NextResponse } from "next/server";

const BASE = process.env.API_BASE || "";

export async function POST(request: Request) {
  try {
    const base = String(BASE).replace(/\/$/, "");
    const body = await request.text();
    const headers = {
      "content-type": request.headers.get("content-type") || "application/json",
    };

    // Try primary endpoint
    let upstream = `${base}/auth/register`;
    let res = await fetch(upstream, { method: "POST", headers, body });

    // Fallback to /auth/register if 404/405
    if (res.status === 404 || res.status === 405) {
      const fallback = `${base}/auth/register`;
      const retry = await fetch(fallback, { method: "POST", headers, body });
      if (retry.status !== 404) {
        res = retry;
        upstream = fallback;
      }
    }

    const text = await res.text();
    const contentType = res.headers.get("content-type") || "text/plain";
    return new Response(text, {
      status: res.status,
      headers: { "content-type": contentType },
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: String(err.message || err) },
      { status: 500 }
    );
  }
}
