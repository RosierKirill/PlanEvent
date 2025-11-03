"use client"
import * as React from "react"
import { useSearchParams } from "next/navigation"

export default function EventsList() {
  const [events, setEvents] = React.useState<any[]>([])
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)

  const searchParams = useSearchParams()
  const tag = searchParams?.get("tag")
  const q = searchParams?.get("q")

  React.useEffect(() => {
    setLoading(true)
    const params = new URLSearchParams()
    if (tag) params.set("tag", tag)
    if (q) params.set("q", q)
    const url = `/api/events${params.toString() ? `?${params.toString()}` : ""}`

    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null
    const headers: Record<string, string> = {}
    if (token) headers['authorization'] = `Bearer ${token}`

    fetch(url, { headers })
      .then(async (res) => {
        const ct = res.headers.get("content-type") || ""
        const text = await res.text()
        if (!res.ok) throw new Error(`Erreur ${res.status}: ${text}`)
        if (!ct.includes("application/json")) throw new Error("Réponse non JSON du serveur")
        return JSON.parse(text)
      })
      .then((data) => {
        setEvents(data)
        setLoading(false)
      })
      .catch((err) => {
        setError(err.message)
        setLoading(false)
      })
  }, [tag, q])

  if (loading) return <div>Chargement des événements...</div>
  if (error) return <div className="text-red-500">Erreur : {error}</div>

  return (
    <div className="space-y-4">
      {events.map((ev) => (
        <a
          key={ev.id}
          href={`/events/${ev.id}`}
          className="block p-4 border rounded-lg bg-card hover:shadow-md transition"
        >
          <h3 className="text-lg font-semibold">{ev.title}</h3>
          <div className="text-sm text-muted-foreground">{ev.date} — {ev.location}</div>
          <p className="mt-2 text-sm">{ev.description}</p>
        </a>
      ))}
    </div>
  )
}
