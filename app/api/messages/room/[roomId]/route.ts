import { NextResponse } from "next/server";

const BASE = process.env.API_BASE || "";

// GET /api/messages/room/:roomId - Retrieve messages for a room
export async function GET(
  request: Request,
  { params }: { params: Promise<{ roomId: string }> }
) {
  try {
    const { roomId } = await params;
    const { searchParams } = new URL(request.url);
    const page = searchParams.get("page") || "1";
    const limit = searchParams.get("limit") || "50";

    const url = `${String(BASE).replace(/\/$/, "")}/messages/room/${roomId}?page=${page}&limit=${limit}`;

    const auth =
      request.headers.get("authorization") ||
      request.headers.get("Authorization");
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
