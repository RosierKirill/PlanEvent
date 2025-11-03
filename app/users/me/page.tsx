"use client"

import * as React from 'react'
import { useRouter } from 'next/navigation'

export default function ProfilePage() {
  const [user, setUser] = React.useState<any | null>(null)
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)
  const router = useRouter()

  React.useEffect(() => {
    setLoading(true)
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null
    const headers: Record<string, string> = {}
    if (token) headers['authorization'] = `Bearer ${token}`

    fetch('/api/users/me', { headers })
      .then(async (res) => {
        const text = await res.text()
        const ct = res.headers.get('content-type') || ''
        const data = ct.includes('application/json') ? JSON.parse(text) : { raw: text }
        if (!res.ok) throw new Error(data?.error || data?.message || data?.raw || `Erreur ${res.status}`)
        setUser(data)
        setLoading(false)
      })
      .catch((err) => {
        setError(err?.message || 'Erreur réseau')
        setLoading(false)
      })
  }, [])

  function logout() {
    try {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
    } catch (e) {}
    router.push('/')
  }

  if (loading) return <div className="p-4">Chargement du profil...</div>
  if (error) return <div className="p-4 text-red-500">Erreur : {error}</div>

  return (
    <main className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-4">Mon profil</h1>
      <div className="p-4 border rounded-md bg-card">
        <pre className="whitespace-pre-wrap text-sm">{JSON.stringify(user, null, 2)}</pre>
        <div className="mt-4">
          <button onClick={logout} className="bg-primary text-primary-foreground px-4 py-2 rounded-md">Se déconnecter</button>
        </div>
      </div>
    </main>
  )
}
