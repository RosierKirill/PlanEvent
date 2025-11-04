"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useAuthToken } from "@/hooks/use-auth";
import { useIsAdmin } from "@/hooks/use-is-admin";

export default function NewRoomPage() {
  const router = useRouter();
  const token = useAuthToken();
  const isAdmin = useIsAdmin();
  const [saving, setSaving] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const [form, setForm] = React.useState({
    name: "",
    event_id: "",
    description: "",
  });

  if (!isAdmin) {
    return (
      <main className="container mx-auto px-4 py-8">
        <div className="text-sm text-muted-foreground">Accès réservé à l'admin.</div>
      </main>
    );
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const headers: Record<string, string> = { "content-type": "application/json" };
      if (token) headers["authorization"] = `Bearer ${token}`;
      const payload: any = {
        name: form.name,
        event_id: form.event_id,
        description: form.description || undefined,
      };
      const res = await fetch("/api/rooms", {
        method: "POST",
        headers,
        body: JSON.stringify(payload),
      });
      const txt = await res.text();
      if (!res.ok) throw new Error(txt || `Erreur ${res.status}`);
      try {
        const created = JSON.parse(txt);
        if (created?.id) router.push(`/rooms/${created.id}`);
        else router.push("/rooms");
      } catch {
        router.push("/rooms");
      }
    } catch (e: any) {
      setError(e?.message || "Création impossible");
    } finally {
      setSaving(false);
    }
  }

  return (
    <main className="container mx-auto px-4 py-8 max-w-3xl">
      <h1 className="text-2xl font-bold mb-6">Créer un groupe</h1>
      {error && <div className="mb-4 text-red-500">{error}</div>}
      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <label className="block text-sm">Nom</label>
          <input
            className="mt-1 w-full border rounded-md px-3 py-2"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            required
          />
        </div>
        <div>
          <label className="block text-sm">Événement (ID)</label>
          <input
            className="mt-1 w-full border rounded-md px-3 py-2"
            value={form.event_id}
            onChange={(e) => setForm({ ...form, event_id: e.target.value })}
            required
          />
        </div>
        <div>
          <label className="block text-sm">Description</label>
          <textarea
            className="mt-1 w-full border rounded-md px-3 py-2"
            rows={4}
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
          />
        </div>
        <div className="flex gap-3">
          <button
            type="button"
            className="px-4 py-2 rounded-md border"
            onClick={() => router.back()}
            disabled={saving}
          >
            Annuler
          </button>
          <button
            type="submit"
            className="px-4 py-2 rounded-md bg-primary text-primary-foreground disabled:opacity-50"
            disabled={saving}
          >
            {saving ? "Création..." : "Créer"}
          </button>
        </div>
      </form>
    </main>
  );
}

