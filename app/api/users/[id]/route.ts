import { NextResponse } from "next/server";

const RAW_BASE = (process.env.API_BASE || "").trim();

export async function GET(request: Request, { params }: { params: any }) {
  try {
    const base = String(RAW_BASE).replace(/\/$/, "");
    const id = (await params).id;
    const url = `${base}/users/${encodeURIComponent(id)}`;
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

export async function PATCH(request: Request, { params }: { params: any }) {
  try {
    const base = String(RAW_BASE).replace(/\/$/, "");
    const id = (await params).id;
    const auth = request.headers.get("authorization") || request.headers.get("Authorization");
    const headers: Record<string, string> = {
      "content-type": request.headers.get("content-type") || "application/json",
    };
    if (auth) headers["authorization"] = auth;
    const body = await request.text();
    let res = await fetch(`${base}/users/${encodeURIComponent(id)}`, {
      method: "PATCH",
      headers,
      body,
    });
    if (res.status === 404 || res.status === 405) {
      const retry = await fetch(`${base}/users/${encodeURIComponent(id)}`, {
        method: "PUT",
        headers,
        body,
      });
      if (retry.status !== 404) res = retry;
    }
    const text = await res.text();
    const contentType = res.headers.get("content-type") || "text/plain";
    return new Response(text, { status: res.status, headers: { "content-type": contentType } });
  } catch (err: any) {
    return NextResponse.json({ error: String(err?.message || err) }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: any }) {
  try {
    const base = String(RAW_BASE).replace(/\/$/, "");
    const id = (await params).id;
    const auth = request.headers.get("authorization") || request.headers.get("Authorization");
    const headers: Record<string, string> = {};
    if (auth) headers["authorization"] = auth;
    const res = await fetch(`${base}/users/${encodeURIComponent(id)}`, {
      method: "DELETE",
      headers,
    });
    const text = await res.text();
    const contentType = res.headers.get("content-type") || "text/plain";
    return new Response(text, { status: res.status, headers: { "content-type": contentType } });
  } catch (err: any) {
    return NextResponse.json({ error: String(err?.message || err) }, { status: 500 });
  }
}
