"use client";

import { useRouter } from "next/navigation";
import * as React from "react";

export default function ProfilePage() {
  const [user, setUser] = React.useState<any | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
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
    { key: "username", label: "Nom d'utilisateur" },
    { key: "email", label: "Email" },
    { key: "id", label: "ID" },
    { key: "createdAt", label: "Créé le" },
    { key: "updatedAt", label: "Mis à jour le" },
  ];

  const visible =
    user && typeof user === "object" ? fields.filter((f) => f.key in user) : [];

  return (
    <main className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-4">Mon profil</h1>
      <div className="p-4 border rounded-md bg-card">
        {visible.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {visible.map(({ key, label }) => (
              <div key={key} className="flex flex-col">
                <span className="text-sm text-muted-foreground">{label}</span>
                <span className="text-base font-medium wrap-break-words">
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
        <div className="mt-6">
          <button
            onClick={logout}
            className="bg-primary text-primary-foreground px-4 py-2 rounded-md"
          >
            Se déconnecter
          </button>
        </div>
      </div>
    </main>
  );
}
