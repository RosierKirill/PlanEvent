import { NextResponse } from 'next/server'

const BASE = process.env.API_BASE || ''

export async function GET(req: Request) {
  try {
    const url = `${String(BASE).replace(/\/$/, '')}/events${new URL(req.url).search}`
    console.log('API_BASE:', process.env.API_BASE)
    console.log('Fetching events from:', url)
    
    const auth = req.headers.get('authorization') || req.headers.get('Authorization')
    const headers: Record<string, string> = { accept: 'application/json' }
    if (auth) headers['authorization'] = auth
    console.log('Request headers:', headers)
    
    const res = await fetch(url, { headers })
    const text = await res.text()
    console.log('Backend response status:', res.status)
    console.log('Backend response body:', text)
    
    const contentType = res.headers.get('content-type') || 'text/plain'
    return new Response(text, { status: res.status, headers: { 'content-type': contentType } })
  } catch (err: any) {
    return NextResponse.json({ error: String(err.message || err) }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const url = `${String(BASE).replace(/\/$/, '')}/events`
    const body = await req.text()
  const auth = req.headers.get('authorization') || req.headers.get('Authorization')
  const headers: Record<string, string> = { 'content-type': req.headers.get('content-type') || 'application/json' }
  if (auth) headers['authorization'] = auth
  const res = await fetch(url, { method: 'POST', headers, body })
    const text = await res.text()
    const contentType = res.headers.get('content-type') || 'text/plain'
    return new Response(text, { status: res.status, headers: { 'content-type': contentType } })
  } catch (err: any) {
    return NextResponse.json({ error: String(err.message || err) }, { status: 500 })
  }
}
