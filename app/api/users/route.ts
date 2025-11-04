import { NextRequest, NextResponse } from "next/server";

const BASE = process.env.API_BASE || "";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const page = searchParams.get("page") || "1";
    const limit = searchParams.get("limit") || "20";
    const search = searchParams.get("search") || "";

    const auth = req.headers.get("authorization");

    const headers: Record<string, string> = {
      accept: "application/json",
    };

    if (auth) {
      headers["authorization"] = auth;
    }

    let url = `${String(BASE).replace(
      /\/$/,
      ""
    )}/users?page=${page}&limit=${limit}`;
    if (search) {
      url += `&search=${encodeURIComponent(search)}`;
    }

    const response = await fetch(url, {
      method: "GET",
      headers,
    });

    if (!response.ok) {
      const text = await response.text();
      console.error("GET /api/users - Error:", text);
      return NextResponse.json(
        { error: "Failed to fetch users" },
        { status: response.status }
      );
    }

    const contentType = response.headers.get("content-type");
    if (contentType && contentType.includes("application/json")) {
      const data = await response.json();
      return NextResponse.json(data, { status: 200 });
    } else {
      return NextResponse.json(
        { error: "Invalid response format" },
        { status: 500 }
      );
    }
  } catch (error: any) {
    console.error("GET /api/users - Error:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
