import { NextResponse } from "next/server";

const RAW_BASE = (process.env.API_BASE || "").trim();

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    if (!id) {
      return NextResponse.json({ error: "Missing user id" }, { status: 400 });
    }

    const url = `${String(RAW_BASE).replace(
      /\/$/,
      ""
    )}/users/${encodeURIComponent(id)}/events${new URL(req.url).search}`;
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
