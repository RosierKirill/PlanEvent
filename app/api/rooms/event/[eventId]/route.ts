import { NextResponse } from "next/server";

const BASE = process.env.API_BASE || "";

export async function GET(request: Request, { params }: { params: any }) {
  try {
    const resolvedParams = await params;
    const eventId = resolvedParams.eventId;

    if (!eventId) {
      return NextResponse.json({ error: "Missing eventId" }, { status: 400 });
    }

    const urlObj = new URL(request.url);
    const page = urlObj.searchParams.get("page") || "1";
    const limit = urlObj.searchParams.get("limit") || "20";

    const upstream = `${String(BASE).replace(
      /\/$/,
      ""
    )}/rooms/event/${encodeURIComponent(eventId)}?page=${page}&limit=${limit}`;

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
