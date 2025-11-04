"use client";

import { useRouter } from "next/navigation";
import * as React from "react";

export default function ProfilePage() {
  const [user, setUser] = React.useState<any | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [editing, setEditing] = React.useState(false);
  const [saving, setSaving] = React.useState(false);
  const [form, setForm] = React.useState<{
    name?: string;
    email?: string;
    currentPassword?: string;
    newPassword?: string;
  }>({});
  const router = useRouter();

  React.useEffect(() => {
    setLoading(true);
    const token =
      typeof window !== "undefined" ? localStorage.getItem("token") : null;
    const headers: Record<string, string> = {};
    if (token) headers["authorization"] = `Bearer ${token}`;

    fetch("/api/users/me", { headers })
      .then(async (res) => {
        const text = await res.text();
        const ct = res.headers.get("content-type") || "";
        const isJson = ct.includes("application/json");
        const data = isJson ? JSON.parse(text || "{}") : { raw: text };
        if (res.status === 401 || res.status === 403) {
          router.push("/login");
          return Promise.reject(new Error("Non authentifié"));
        }
        if (!res.ok) {
          throw new Error(
            data?.error || data?.message || data?.raw || `Erreur ${res.status}`
          );
        }
        setUser(data);
        setForm({
          name: (data as any)?.name ?? "",
          email: (data as any)?.email ?? "",
        });
        setLoading(false);
      })
      .catch((err) => {
        setError(err?.message || "Erreur réseau");
        setLoading(false);
      });
  }, []);

  function logout() {
    try {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      // Notify that auth state has changed
      window.dispatchEvent(new Event("auth-state-changed"));
    } catch (e) {}
    router.push("/");
  }

  if (loading) return <div className="p-4">Chargement du profil...</div>;
  if (error) return <div className="p-4 text-red-500">Erreur : {error}</div>;

  // Render fields instead of raw JSON
  const fields: Array<{ key: string; label: string }> = [
    { key: "name", label: "Nom" },
    { key: "email", label: "Email" },
    { key: "id", label: "ID" },
  ];

  const visible =
    user && typeof user === "object" ? fields.filter((f) => f.key in user) : [];

  async function saveProfile(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
      const headers: Record<string, string> = { "content-type": "application/json" };
      if (token) headers["authorization"] = `Bearer ${token}`;
      // Validate password fields if provided
      if (form.newPassword || form.currentPassword) {
        const current = form.currentPassword?.trim() || "";
        const pwd = form.newPassword?.trim() || "";
        if (!current || !pwd) throw new Error("Ancien et nouveau mot de passe requis");
        if (pwd.length < 6) throw new Error("Le mot de passe doit contenir au moins 6 caractères");
      }

      // 1) Update profile (name/email) if provided
      const profilePayload: any = {
        name: form.name,
        email: form.email,
      };
      let mergedUser: any = null;
      if (profilePayload.name !== undefined || profilePayload.email !== undefined) {
        const resProfile = await fetch("/api/users/me", {
          method: "PATCH",
          headers,
          body: JSON.stringify(profilePayload),
        });
        const textP = await resProfile.text();
        const ctP = resProfile.headers.get("content-type") || "";
        const dataP = ctP.includes("application/json") ? JSON.parse(textP || "{}") : { raw: textP };
        if (!resProfile.ok) {
          throw new Error(dataP?.error || dataP?.message || dataP?.raw || `Erreur ${resProfile.status}`);
        }
        mergedUser = dataP;
      }

      // 2) Update password if provided (via /api/users/me/password)
      if (form.newPassword && form.newPassword.trim()) {
        const current = form.currentPassword?.trim() || "";
        const pwd = form.newPassword.trim();
        // Backend expects camelCase keys per Swagger
        const passwordPayload: any = { currentPassword: current, newPassword: pwd };
        const resPwd = await fetch("/api/users/me/password", {
          method: "PATCH",
          headers,
          body: JSON.stringify(passwordPayload),
        });
        const textW = await resPwd.text();
        const ctW = resPwd.headers.get("content-type") || "";
        const dataW = ctW.includes("application/json") ? JSON.parse(textW || "{}") : { raw: textW };
        if (!resPwd.ok) {
          throw new Error(dataW?.error || dataW?.message || dataW?.raw || `Erreur ${resPwd.status}`);
        }
      }

      if (mergedUser && typeof mergedUser === "object") {
        setUser((prev: any) => ({ ...(prev || {}), ...(mergedUser || {}) }));
      }
      setEditing(false);
      setForm((f) => ({ ...f, currentPassword: "", newPassword: "" }));
    } catch (err: any) {
      setError(err?.message || "Impossible d'enregistrer le profil");
    } finally {
      setSaving(false);
    }
  }

  return (
    <main className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-4">Mon profil</h1>
      <div className="p-4 border rounded-md bg-card">
        {!editing ? (
          <>
            {visible.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {visible.map(({ key, label }) => (
                  <div key={key} className="flex flex-col">
                    <span className="text-sm text-muted-foreground">{label}</span>
                    <span className="text-base font-medium break-words">
                      {String((user as any)[key])}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-sm text-muted-foreground">
                Aucune information de profil à afficher.
              </div>
            )}
            <div className="mt-6 flex gap-3">
              <button
                onClick={() => setEditing(true)}
                className="px-4 py-2 rounded-md border hover:bg-accent"
              >
                Modifier le profil
              </button>
              <button
                onClick={logout}
                className="bg-primary text-primary-foreground px-4 py-2 rounded-md"
              >
                Se déconnecter
              </button>
            </div>
          </>
        ) : (
          <form onSubmit={saveProfile} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col">
                <label className="text-sm text-muted-foreground">Nom</label>
                <input
                  type="text"
                  value={form.name ?? ""}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  className="mt-1 px-3 py-2 border rounded-md bg-background"
                />
              </div>
              <div className="flex flex-col md:col-span-2">
                <label className="text-sm text-muted-foreground">Email</label>
                <input
                  type="email"
                  value={form.email ?? ""}
                  onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                  className="mt-1 px-3 py-2 border rounded-md bg-background"
                />
              </div>
            </div>
            {/* Password change (two fields only) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col">
                <label className="text-sm text-muted-foreground">Ancien mot de passe</label>
                <input
                  type="password"
                  value={form.currentPassword ?? ""}
                  onChange={(e) => setForm((f) => ({ ...f, currentPassword: e.target.value }))}
                  placeholder="Requis pour changer le mot de passe"
                  className="mt-1 px-3 py-2 border rounded-md bg-background"
                  autoComplete="current-password"
                />
              </div>
              <div className="flex flex-col">
                <label className="text-sm text-muted-foreground">Nouveau mot de passe</label>
                <input
                  type="password"
                  value={form.newPassword ?? ""}
                  onChange={(e) => setForm((f) => ({ ...f, newPassword: e.target.value }))}
                  placeholder="Laisser vide pour ne pas changer"
                  className="mt-1 px-3 py-2 border rounded-md bg-background"
                  autoComplete="new-password"
                />
              </div>
            </div>
            <div className="pt-2 flex gap-3">
              <button
                type="button"
                onClick={() => {
                  setEditing(false);
                  setForm({
                    name: (user as any)?.name ?? "",
                    email: (user as any)?.email ?? "",
                    currentPassword: "",
                    newPassword: "",
                  });
                }}
                className="px-4 py-2 rounded-md border hover:bg-accent"
                disabled={saving}
              >
                Annuler
              </button>
              <button
                type="submit"
                className="bg-primary text-primary-foreground px-4 py-2 rounded-md disabled:opacity-50"
                disabled={saving}
              >
                {saving ? "Enregistrement..." : "Enregistrer"}
              </button>
            </div>
          </form>
        )}
      </div>
    </main>
  );
}
