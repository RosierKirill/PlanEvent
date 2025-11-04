import { NextRequest, NextResponse } from "next/server";

const BASE = process.env.API_BASE || "";

export async function POST(req: NextRequest) {
  try {
    const auth = req.headers.get("authorization");
    const body = await req.json();

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      accept: "application/json",
    };

    if (auth) {
      headers["authorization"] = auth;
    }

    const url = `${String(BASE).replace(/\/$/, "")}/room-members`;

    const response = await fetch(url, {
      method: "POST",
      headers,
      body: JSON.stringify(body),
    });

    const contentType = response.headers.get("content-type");
    let data;

    if (contentType && contentType.includes("application/json")) {
      data = await response.json();
    } else {
      data = await response.text();
    }

    return NextResponse.json(data, { status: response.status });
  } catch (error: any) {
    console.error("POST /api/room-members - Error:", error);
    return NextResponse.json(
      { error: error.message || "Erreur serveur" },
      { status: 500 }
    );
  }
}
