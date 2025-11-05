import { NextResponse } from "next/server";

const RAW_BASE = (process.env.API_BASE || "").trim();

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const url = `${String(RAW_BASE).replace(/\/$/, "")}/groups/${id}`;
    const auth =
      req.headers.get("authorization") || req.headers.get("Authorization");
    const headers: Record<string, string> = { accept: "application/json" };
    if (auth) headers["authorization"] = auth;

    const res = await fetch(url, { headers });
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

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const base = String(RAW_BASE).replace(/\/$/, "");
    if (!base) {
      return NextResponse.json(
        { error: "API_BASE non configuré côté serveur" },
        { status: 501 }
      );
    }
    const url = `${base}/groups/${id}`;
    const body = await req.text();
    const auth =
      req.headers.get("authorization") || req.headers.get("Authorization");
    const headers: Record<string, string> = {
      "content-type": req.headers.get("content-type") || "application/json",
    };
    if (auth) headers["authorization"] = auth;
    const res = await fetch(url, { method: "PATCH", headers, body });
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

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const base = String(RAW_BASE).replace(/\/$/, "");
    if (!base) {
      return NextResponse.json(
        { error: "API_BASE non configuré côté serveur" },
        { status: 501 }
      );
    }
    const url = `${base}/groups/${id}`;
    const auth =
      req.headers.get("authorization") || req.headers.get("Authorization");
    const headers: Record<string, string> = { accept: "application/json" };
    if (auth) headers["authorization"] = auth;
    const res = await fetch(url, { method: "DELETE", headers });
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
