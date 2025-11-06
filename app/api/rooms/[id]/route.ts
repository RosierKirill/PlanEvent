import { NextRequest, NextResponse } from "next/server";

const RAW_BASE = (process.env.API_BASE || "").trim();

export async function GET(
  req: NextRequest,
  { params }: { params: any }
) {
  try {
    const resolvedParams = await params;
    const id = resolvedParams.id;

    const auth = req.headers.get("authorization") || req.headers.get("Authorization");

    const headers: Record<string, string> = {
      accept: "application/json",
    };

    if (auth) {
      headers["authorization"] = auth;
    }

    const url = `${String(RAW_BASE).replace(/\/$/, "")}/rooms/${encodeURIComponent(id)}`;

    const response = await fetch(url, {
      method: "GET",
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

export async function PATCH(req: NextRequest, { params }: { params: any }) {
  try {
    const resolved = await params;
    const id = resolved.id;
    const base = String(RAW_BASE).replace(/\/$/, "");
    if (!base) return NextResponse.json({ error: "API_BASE manquant" }, { status: 501 });

    const auth = req.headers.get("authorization") || req.headers.get("Authorization");
    const headers: Record<string, string> = {
      "content-type": req.headers.get("content-type") || "application/json",
    };
    if (auth) headers["authorization"] = auth;
    const body = await req.text();

    // Owner enforcement: Only the room owner can update
    try {
      // Fetch current user
      const meRes = await fetch(`${base}/users/me`, {
        headers: auth ? { authorization: auth, accept: "application/json" } : { accept: "application/json" },
      });
      if (!meRes.ok) {
        const txt = await meRes.text();
        return new Response(txt || "Non autorisé", { status: meRes.status });
      }
      const me = await meRes.json().catch(() => ({} as any));

      // Fetch room to check owner
      const roomRes = await fetch(`${base}/rooms/${encodeURIComponent(id)}`, {
        headers: auth ? { authorization: auth, accept: "application/json" } : { accept: "application/json" },
      });
      if (!roomRes.ok) {
        const txt = await roomRes.text();
        return new Response(txt || "Groupe introuvable", { status: roomRes.status });
      }
      const room = await roomRes.json().catch(() => ({} as any));

      const meId = String(me?.id || "");
      const ownerId = String(room?.user_id || room?.owner_id || "");
      if (!meId || !ownerId || meId !== ownerId) {
        return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
      }
    } catch (checkErr: any) {
      return NextResponse.json({ error: String(checkErr?.message || checkErr || "Vérification impossible") }, { status: 500 });
    }

    let res = await fetch(`${base}/rooms/${encodeURIComponent(id)}`, {
      method: "PATCH",
      headers,
      body,
    });
    if (res.status === 404 || res.status === 405) {
      const retry = await fetch(`${base}/rooms/${encodeURIComponent(id)}`, {
        method: "PUT",
        headers,
        body,
      });
      if (retry.status !== 404) res = retry;
    }
    const text = await res.text();
    const ct = res.headers.get("content-type") || "text/plain";
    return new Response(text, { status: res.status, headers: { "content-type": ct } });
  } catch (error: any) {
    return NextResponse.json({ error: String(error?.message || error) }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: any }) {
  try {
    const resolved = await params;
    const id = resolved.id;
    const base = String(RAW_BASE).replace(/\/$/, "");
    if (!base) return NextResponse.json({ error: "API_BASE manquant" }, { status: 501 });

    const auth = req.headers.get("authorization") || req.headers.get("Authorization");
    const headers: Record<string, string> = {};
    if (auth) headers["authorization"] = auth;

    const res = await fetch(`${base}/rooms/${encodeURIComponent(id)}`, {
      method: "DELETE",
      headers,
    });
    const text = await res.text();
    const ct = res.headers.get("content-type") || "text/plain";
    return new Response(text, { status: res.status, headers: { "content-type": ct } });
  } catch (error: any) {
    return NextResponse.json({ error: String(error?.message || error) }, { status: 500 });
  }
}
