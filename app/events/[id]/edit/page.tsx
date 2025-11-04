"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useAuthToken } from "@/hooks/use-auth";

interface Props {
  params: any;
}

export default function EditEventPage({ params }: Props) {
  const router = useRouter();
  const token = useAuthToken();
  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const [form, setForm] = React.useState({
    name: "",
    location: "",
    organizer: "",
    start_date: "",
    end_date: "",
    description: "",
    tags: "",
    total_participants: "0",
  });

  React.useEffect(() => {
    (async () => {
      try {
        const id = (await params)?.id;
        const res = await fetch(`/api/events/${id}`);
        const txt = await res.text();
        if (!res.ok) throw new Error(txt || `Erreur ${res.status}`);
        const data = JSON.parse(txt);
        setForm({
          name: data.name || data.title || "",
          location: data.location || "",
          organizer: data.organizer || "",
          start_date: data.start_date ? new Date(data.start_date).toISOString().slice(0,16) : "",
          end_date: data.end_date ? new Date(data.end_date).toISOString().slice(0,16) : "",
          description: data.description || "",
          tags: Array.isArray(data.tags) ? data.tags.join(", ") : "",
          total_participants: String(
            typeof data.total_participants === 'number' ? data.total_participants : (data.attendees ?? 0)
          ),
        });
        setLoading(false);
      } catch (e: any) {
        setError(e?.message || "Chargement impossible");
        setLoading(false);
      }
    })();
  }, [params]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const id = (await params)?.id;
      const headers: Record<string, string> = { "content-type": "application/json" };
      if (token) headers["authorization"] = `Bearer ${token}`;
      const toIsoOrUndef = (v: string) => {
        if (!v) return undefined;
        const d = new Date(v);
        return isNaN(d.getTime()) ? undefined : d.toISOString();
      };
      const payload: any = {
        name: form.name,
        start_date: toIsoOrUndef(form.start_date),
        end_date: toIsoOrUndef(form.end_date),
        location: form.location || undefined,
        organizer: form.organizer || undefined,
        description: form.description || undefined,
        total_participants: Number.isFinite(Number(form.total_participants))
          ? Number(form.total_participants)
          : 0,
      };
      const tags = form.tags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean);
      if (tags.length) payload.tags = tags;

      const res = await fetch(`/api/events/${id}`, {
        method: "PATCH",
        headers,
        body: JSON.stringify(payload),
      });
      const txt = await res.text();
      if (!res.ok) throw new Error(txt || `Erreur ${res.status}`);
      router.push(`/events/${id}`);
    } catch (e: any) {
      setError(e?.message || "Mise à jour impossible");
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <div className="p-4">Chargement...</div>;

  return (
    <main className="container mx-auto px-4 py-8 max-w-3xl">
      <h1 className="text-2xl font-bold mb-6">Modifier l'événement</h1>
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
          <label className="block text-sm">Lieu</label>
          <input
            className="mt-1 w-full border rounded-md px-3 py-2"
            value={form.location}
            onChange={(e) => setForm({ ...form, location: e.target.value })}
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm">Début</label>
            <input
              type="datetime-local"
              className="mt-1 w-full border rounded-md px-3 py-2"
              value={form.start_date}
              onChange={(e) => setForm({ ...form, start_date: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm">Fin</label>
            <input
              type="datetime-local"
              className="mt-1 w-full border rounded-md px-3 py-2"
              value={form.end_date}
              onChange={(e) => setForm({ ...form, end_date: e.target.value })}
            />
          </div>
        </div>
        <div>
          <label className="block text-sm">Organisateur</label>
          <input
            className="mt-1 w-full border rounded-md px-3 py-2"
            value={form.organizer}
            onChange={(e) => setForm({ ...form, organizer: e.target.value })}
          />
        </div>
        <div>
          <label className="block text-sm">Tags (séparés par des virgules)</label>
          <input
            className="mt-1 w-full border rounded-md px-3 py-2"
            value={form.tags}
            onChange={(e) => setForm({ ...form, tags: e.target.value })}
          />
        </div>
        <div>
          <label className="block text-sm">Participants (total)</label>
          <input
            type="number"
            min={0}
            className="mt-1 w-full border rounded-md px-3 py-2"
            value={form.total_participants}
            onChange={(e) => setForm({ ...form, total_participants: e.target.value })}
          />
        </div>
        <div>
          <label className="block text-sm">Description</label>
          <textarea
            className="mt-1 w-full border rounded-md px-3 py-2"
            rows={5}
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
