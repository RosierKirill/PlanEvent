import { NextResponse } from "next/server";

const BASE = process.env.API_BASE || "";

export async function GET(request: Request) {
  try {
    const url = `${String(BASE).replace(/\/$/, "")}/rooms${
      new URL(request.url).search
    }`;
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
