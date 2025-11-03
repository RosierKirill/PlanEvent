import { NextResponse } from "next/server"

const BASE = process.env.API_BASE || ''

export async function POST(request: Request) {
  try {
    const upstream = `${String(BASE).replace(/\/$/, '')}/auth/signup`
    const body = await request.text()
    const res = await fetch(upstream, {
      method: 'POST',
      headers: { 'content-type': request.headers.get('content-type') || 'application/json' },
      body,
    })
    const text = await res.text()
    const contentType = res.headers.get('content-type') || 'text/plain'
    return new Response(text, { status: res.status, headers: { 'content-type': contentType } })
  } catch (err: any) {
    return NextResponse.json({ error: String(err.message || err) }, { status: 500 })
  }
}
