import { NextRequest, NextResponse } from "next/server";

const BASE = process.env.API_BASE || "";

export async function GET(
  req: NextRequest,
  { params }: { params: any }
) {
  try {
    const resolvedParams = await params;
    const roomId = resolvedParams.roomId;

    const auth = req.headers.get("authorization");

    if (!auth) {
      return NextResponse.json(
        { is_member: false, members: [] },
        { status: 200 }
      );
    }

    const headers: Record<string, string> = {
      accept: "application/json",
    };

    if (auth) {
      headers["authorization"] = auth;
    }

    // Get all members of the room
    const url = `${String(BASE).replace(/\/$/, "")}/room-members/room/${encodeURIComponent(roomId)}`;
    console.log("GET /api/room-members/check - URL:", url);

    const response = await fetch(url, {
      method: "GET",
      headers,
    });

    console.log("GET /api/room-members/check - Status:", response.status);

    if (!response.ok) {
      return NextResponse.json(
        { is_member: false, members: [] },
        { status: 200 }
      );
    }

    const contentType = response.headers.get("content-type");
    let data;

    if (contentType && contentType.includes("application/json")) {
      try {
        data = await response.json();
      } catch (e) {
        console.error("GET /api/room-members/check - JSON parse error:", e);
        return NextResponse.json(
          { is_member: false, members: [] },
          { status: 200 }
        );
      }
    } else {
      // If not JSON, try to read as text for debugging
      const text = await response.text();
      console.log("GET /api/room-members/check - Non-JSON response:", text);
      return NextResponse.json(
        { is_member: false, members: [] },
        { status: 200 }
      );
    }

    console.log("GET /api/room-members/check - Response:", data);

    // Handle different response structures
    let members = [];
    if (Array.isArray(data)) {
      members = data;
    } else if (data.items && Array.isArray(data.items)) {
      members = data.items;
    } else if (data.members && Array.isArray(data.members)) {
      members = data.members;
    } else if (data.data && Array.isArray(data.data)) {
      members = data.data;
    }

    console.log("GET /api/room-members/check - Extracted members:", members);

    // Return the members list so the frontend can check
    // The frontend will compare user IDs
    return NextResponse.json(
      { members, is_member: null },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("GET /api/room-members/check - Error:", error);
    return NextResponse.json(
      { is_member: false, members: [] },
      { status: 200 }
    );
  }
}
