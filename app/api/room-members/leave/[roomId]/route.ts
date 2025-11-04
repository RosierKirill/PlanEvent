import { NextRequest, NextResponse } from "next/server";

const BASE = process.env.API_BASE || "";

export async function DELETE(
  req: NextRequest,
  { params }: { params: any }
) {
  try {
    const resolvedParams = await params;
    const roomId = resolvedParams.roomId;

    const auth = req.headers.get("authorization");

    const headers: Record<string, string> = {
      accept: "application/json",
    };

    if (auth) {
      headers["authorization"] = auth;
    }

    const url = `${String(BASE).replace(/\/$/, "")}/room-members/leave/${encodeURIComponent(roomId)}`;

    const response = await fetch(url, {
      method: "DELETE",
      headers,
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
    return NextResponse.json(
      { error: error.message || "Erreur serveur" },
      { status: 500 }
    );
  }
}
