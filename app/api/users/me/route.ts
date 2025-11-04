import { NextResponse } from "next/server";

// Trim to avoid accidental leading/trailing spaces in .env
const RAW_BASE = (process.env.API_BASE || "").trim();

export async function GET(request: Request) {
  try {
    const upstream = `${String(RAW_BASE).replace(/\/$/, "")}/users/me`;
    const auth =
      request.headers.get("authorization") ||
      request.headers.get("Authorization");
    const headers: Record<string, string> = { accept: "application/json" };
    if (auth) headers["authorization"] = auth;

    const res = await fetch(upstream, { headers });
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

export async function PATCH(request: Request) {
  try {
    const base = String(RAW_BASE).replace(/\/$/, "");
    if (!base) {
      return NextResponse.json(
        { error: "API_BASE non configuré côté serveur" },
        { status: 501 }
      );
    }
    const upstream = `${base}/users/me`;
    const auth =
      request.headers.get("authorization") ||
      request.headers.get("Authorization");
    const contentType =
      request.headers.get("content-type") || "application/json";
    const body = await request.text();

    const headers: Record<string, string> = { "content-type": contentType };
    if (auth) headers["authorization"] = auth;

    // Try PATCH first
    let res = await fetch(upstream, { method: "PATCH", headers, body });
    // Fallback to PUT if endpoint doesn't accept PATCH
    if (res.status === 404 || res.status === 405) {
      const retry = await fetch(upstream, { method: "PUT", headers, body });
      if (retry.status !== 404) {
        res = retry;
      }
    }

    const text = await res.text();
    const ct = res.headers.get("content-type") || "text/plain";
    return new Response(text, {
      status: res.status,
      headers: { "content-type": ct },
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: String(err.message || err) },
      { status: 500 }
    );
  }
}
