import { NextResponse } from "next/server";

const RAW_BASE = (process.env.API_BASE || "").trim();

export async function GET(request: Request) {
  try {
    const base = String(RAW_BASE).replace(/\/$/, "");
    if (!base) return NextResponse.json({ error: "API_BASE manquant" }, { status: 501 });
    const url = `${base}/users${new URL(request.url).search}`;
    const auth = request.headers.get("authorization") || request.headers.get("Authorization");
    const headers: Record<string, string> = { accept: "application/json" };
    if (auth) headers["authorization"] = auth;
    const res = await fetch(url, { headers });
    const text = await res.text();
    const contentType = res.headers.get("content-type") || "text/plain";
    return new Response(text, { status: res.status, headers: { "content-type": contentType } });
  } catch (err: any) {
    return NextResponse.json({ error: String(err?.message || err) }, { status: 500 });
  }
}

