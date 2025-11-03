"use client"
import * as React from "react"
import { useRouter } from "next/navigation"

export default function SignupForm() {
  const router = useRouter()
  const [name, setName] = React.useState("")
  const [email, setEmail] = React.useState("")
  const [password, setPassword] = React.useState("")
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      })
      const dataText = await res.text()
      const ct = res.headers.get('content-type') || ''
      const data = ct.includes('application/json') ? JSON.parse(dataText) : { raw: dataText }

      if (!res.ok) {
        setError(data?.error || data?.message || data?.raw || 'Erreur lors de la création du compte')
        setLoading(false)
        return
      }

      const token = data?.token || data?.access_token || data?.jwt || data?.data?.token
      const user = data?.user || data?.profile || data?.data || data
      try {
        if (token) localStorage.setItem('token', token)
        if (user) localStorage.setItem('user', JSON.stringify(user))
      } catch (e) {}

      router.push('/')
    } catch (err: any) {
      setError(err?.message || "Erreur réseau")
      setLoading(false)
    }
  }

  return (
    <form onSubmit={onSubmit} className="max-w-md mx-auto space-y-4">
      {error && <div className="text-red-500">{error}</div>}

      <label className="block">
        <span className="text-sm">Nom</span>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="mt-1 block w-full rounded-md border px-3 py-2"
          required
        />
      </label>

      <label className="block">
        <span className="text-sm">Email</span>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="mt-1 block w-full rounded-md border px-3 py-2"
          required
        />
      </label>

      <label className="block">
        <span className="text-sm">Mot de passe</span>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="mt-1 block w-full rounded-md border px-3 py-2"
          required
        />
      </label>

      <div className="flex items-center justify-between">
        <button
          type="submit"
          className="bg-primary text-primary-foreground px-4 py-2 rounded-md"
          disabled={loading}
        >
          {loading ? "Création..." : "Créer un compte"}
        </button>
      </div>
    </form>
  )
}
