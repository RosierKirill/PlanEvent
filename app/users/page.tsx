"use client";

import { useAuthToken } from "@/hooks/use-auth";
import { useIsAdmin } from "@/hooks/use-is-admin";
import * as React from "react";

export default function UsersAdminPage() {
  const isAdmin = useIsAdmin();
  const token = useAuthToken();
  const [users, setUsers] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [savingId, setSavingId] = React.useState<string | null>(null);
  const [deletingId, setDeletingId] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!isAdmin) return;
    setLoading(true);
    const headers: Record<string, string> = token
      ? { authorization: `Bearer ${token}` }
      : {};
    fetch(`/api/users?limit=1000`, { headers })
      .then(async (res) => {
        const txt = await res.text();
        if (!res.ok) throw new Error(txt || `Erreur ${res.status}`);
        const data = JSON.parse(txt || "{}");
        let list: any[] = [];
        if (Array.isArray(data)) list = data;
        else if (data?.items) list = data.items;
        else if (data?.users) list = data.users;
        else if (data?.data) list = data.data;
        return list;
      })
      .then((list) => setUsers(list))
      .catch((e) => setError(e?.message || "Chargement impossible"))
      .finally(() => setLoading(false));
  }, [isAdmin, token]);

  async function save(u: any) {
    if (!token) return;
    setSavingId(u.id);
    try {
      const headers: Record<string, string> = {
        "content-type": "application/json",
        authorization: `Bearer ${token}`,
      };
      const payload = { name: u.name, email: u.email, role: u.role };
      const res = await fetch(`/api/users/${u.id}`, {
        method: "PATCH",
        headers,
        body: JSON.stringify(payload),
      });
      const responseText = await res.text();
      if (!res.ok) throw new Error(responseText || `Erreur ${res.status}`);
      alert("Utilisateur mis à jour avec succès");
    } catch (e: any) {
      console.error("Save error:", e);
      alert(e?.message || "Sauvegarde impossible");
    } finally {
      setSavingId(null);
    }
  }

  async function remove(id: string) {
    if (!token) return;
    if (!confirm("Supprimer cet utilisateur ?")) return;
    setDeletingId(id);
    try {
      const headers: Record<string, string> = {
        authorization: `Bearer ${token}`,
      };
      const res = await fetch(`/api/users/${id}`, {
        method: "DELETE",
        headers,
      });
      if (!res.ok) throw new Error(await res.text());
      setUsers((prev) => prev.filter((x) => x.id !== id));
    } catch (e: any) {
      alert(e?.message || "Suppression impossible");
    } finally {
      setDeletingId(null);
    }
  }

  if (!isAdmin)
    return (
      <main className="container mx-auto px-4 py-8">
        <div className="text-sm text-muted-foreground">
          Accès réservé à l'admin.
        </div>
      </main>
    );

  if (loading) return <div className="p-4">Chargement...</div>;
  if (error) return <div className="p-4 text-red-500">Erreur: {error}</div>;

  return (
    <main className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-4">Utilisateurs</h1>
      <div className="overflow-x-auto border rounded-md">
        <table className="min-w-full text-sm">
          <thead className="bg-muted">
            <tr>
              <th className="p-2 text-left">ID</th>
              <th className="p-2 text-left">Nom</th>
              <th className="p-2 text-left">Email</th>
              <th className="p-2 text-left">Rôle</th>
              <th className="p-2 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id} className="border-t">
                <td className="p-2 align-top whitespace-nowrap">{u.id}</td>
                <td className="p-2 align-top">
                  <input
                    className="border rounded px-2 py-1 w-56"
                    value={u.name || ""}
                    onChange={(e) =>
                      setUsers((prev) =>
                        prev.map((x) =>
                          x.id === u.id ? { ...x, name: e.target.value } : x
                        )
                      )
                    }
                  />
                </td>
                <td className="p-2 align-top">
                  <input
                    className="border rounded px-2 py-1 w-64"
                    value={u.email || ""}
                    onChange={(e) =>
                      setUsers((prev) =>
                        prev.map((x) =>
                          x.id === u.id ? { ...x, email: e.target.value } : x
                        )
                      )
                    }
                  />
                </td>
                <td className="p-2 align-top">
                  <select
                    className="border rounded px-2 py-1 w-32 dark:bg-background "
                    value={u.role || "user"}
                    onChange={(e) =>
                      setUsers((prev) =>
                        prev.map((x) =>
                          x.id === u.id ? { ...x, role: e.target.value } : x
                        )
                      )
                    }
                  >
                    <option value="user">user</option>
                    <option value="admin">admin</option>
                  </select>
                </td>
                <td className="p-2 align-top text-center">
                  <button
                    onClick={() => save(u)}
                    disabled={savingId === u.id}
                    className="px-3 py-1.5 rounded-md border hover:bg-accent disabled:opacity-50 mr-2"
                  >
                    {savingId === u.id ? "Enregistrement..." : "Enregistrer"}
                  </button>
                  <button
                    onClick={() => remove(u.id)}
                    disabled={deletingId === u.id}
                    className="px-3 py-1.5 rounded-md bg-destructive text-destructive-foreground disabled:opacity-50"
                  >
                    {deletingId === u.id ? "Suppression..." : "Supprimer"}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  );
}
