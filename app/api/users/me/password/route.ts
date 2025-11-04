import { NextResponse } from "next/server";

const RAW_BASE = (process.env.API_BASE || "").trim();

export async function PATCH(request: Request) {
  try {
    const base = String(RAW_BASE).replace(/\/$/, "");
    if (!base) {
      return NextResponse.json(
        { error: "API_BASE non configuré côté serveur" },
        { status: 501 }
      );
    }
    const upstream = `${base}/users/me/password`;
    const auth = request.headers.get("authorization") || request.headers.get("Authorization");
    const contentType = request.headers.get("content-type") || "application/json";
    const headers: Record<string, string> = { "content-type": contentType };
    if (auth) headers["authorization"] = auth;
    const body = await request.text();

    let res = await fetch(upstream, { method: "PATCH", headers, body });
    if (res.status === 404 || res.status === 405) {
      // Fallback to PUT, then POST if needed
      let retry = await fetch(upstream, { method: "PUT", headers, body });
      if (retry.status === 404 || retry.status === 405) {
        retry = await fetch(upstream, { method: "POST", headers, body });
      }
      if (retry.status !== 404) res = retry;
    }
    const text = await res.text();
    const ct = res.headers.get("content-type") || "text/plain";
    return new Response(text, { status: res.status, headers: { "content-type": ct } });
  } catch (err: any) {
    return NextResponse.json(
      { error: String(err.message || err) },
      { status: 500 }
    );
  }
}

