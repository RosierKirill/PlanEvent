"use client";

import * as React from "react";
import { useRouter, useParams } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";

export default function EditRoomPage() {
  const router = useRouter();
  const params = useParams();
  const roomId = params.id as string;
  const { token, user, isAuthenticated } = useAuth();
  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [isOwner, setIsOwner] = React.useState<boolean>(false);

  const [form, setForm] = React.useState({
    name: "",
    description: "",
  });

  React.useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`/api/rooms/${roomId}`, {
          headers: token ? { authorization: `Bearer ${token}` } : {},
        });
        const txt = await res.text();
        if (!res.ok) throw new Error(txt || `Erreur ${res.status}`);
        const data = JSON.parse(txt);
        setForm({
          name: data.name || "",
          description: data.description || "",
        });
        const ownerId = String(data.user_id || data.owner_id || "");
        const meId = String(user?.id || "");
        setIsOwner(!!meId && !!ownerId && meId === ownerId);
        setLoading(false);
      } catch (e: any) {
        setError(e?.message || "Chargement impossible");
        setLoading(false);
      }
    })();
  }, [roomId, token, user?.id]);

  if (!isAuthenticated) {
    return (
      <main className="container mx-auto px-4 py-8">
        <div className="text-sm text-muted-foreground">Veuillez vous connecter.</div>
      </main>
    );
  }

  if (!isOwner && !loading) {
    return (
      <main className="container mx-auto px-4 py-8">
        <div className="text-sm text-muted-foreground">Accès réservé au propriétaire du groupe.</div>
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
        description: form.description || undefined,
      };
      const res = await fetch(`/api/rooms/${roomId}`, {
        method: "PATCH",
        headers,
        body: JSON.stringify(payload),
      });
      const txt = await res.text();
      if (!res.ok) throw new Error(txt || `Erreur ${res.status}`);
      router.push(`/rooms/${roomId}`);
    } catch (e: any) {
      setError(e?.message || "Mise à jour impossible");
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <div className="p-4">Chargement...</div>;

  return (
    <main className="container mx-auto px-4 py-8 max-w-3xl">
      <h1 className="text-2xl font-bold mb-6">Modifier le groupe</h1>
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
            {saving ? "Enregistrement..." : "Enregistrer"}
          </button>
        </div>
      </form>
    </main>
  );
}
