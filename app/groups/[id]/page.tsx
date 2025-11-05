"use client";

import { useAuthToken } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Calendar, Users, ArrowLeft } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import * as React from "react";

export default function GroupDetailPage() {
  const params = useParams();
  const router = useRouter();
  const groupId = params?.id as string;
  const token = useAuthToken();

  const [group, setGroup] = React.useState<any>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!groupId) return;

    const headers: Record<string, string> = {};
    if (token) headers["authorization"] = `Bearer ${token}`;

    fetch(`/api/groups/${groupId}`, { headers })
      .then(async (res) => {
        const ct = res.headers.get("content-type") || "";
        const text = await res.text();

        if (!res.ok) throw new Error(`Erreur ${res.status}: ${text}`);
        if (!ct.includes("application/json"))
          throw new Error("Réponse non JSON du serveur");

        return JSON.parse(text);
      })
      .then((data) => {
        setGroup(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, [groupId, token]);

  if (loading) {
    return (
      <main className="container mx-auto px-4 py-8">
        <div>Chargement du groupe...</div>
      </main>
    );
  }

  if (error || !group) {
    return (
      <main className="container mx-auto px-4 py-8">
        <div className="text-red-500">
          Erreur : {error || "Groupe non trouvé"}
        </div>
        <Button
          variant="outline"
          onClick={() => router.push("/groups")}
          className="mt-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Retour aux groupes
        </Button>
      </main>
    );
  }

  const imageUrl = group.image_url || "/group-placeholder.png";
  const createdAt = group.created_at
    ? new Date(group.created_at).toLocaleDateString("fr-FR", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "";

  return (
    <main className="container mx-auto px-4 py-8">
      <Button
        variant="ghost"
        onClick={() => router.back()}
        className="mb-6"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Retour
      </Button>

      <div className="grid md:grid-cols-[300px_1fr] gap-8">
        {/* Image du groupe */}
        <div className="space-y-4">
          <div className="aspect-square rounded-xl overflow-hidden bg-muted border">
            <img
              src={imageUrl}
              alt={group.name}
              className="w-full h-full object-cover"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = "/group-placeholder.png";
              }}
            />
          </div>

          {group.member_count !== undefined && (
            <div className="flex items-center gap-2 text-sm p-4 border rounded-lg bg-card">
              <Users className="w-5 h-5 text-muted-foreground" />
              <div>
                <div className="font-semibold">{group.member_count}</div>
                <div className="text-muted-foreground">
                  {group.member_count <= 1 ? "membre" : "membres"}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Contenu principal */}
        <div className="space-y-6">
          <div>
            <h1 className="text-4xl font-bold mb-2">{group.name}</h1>
            {createdAt && (
              <div className="flex items-center gap-2 text-muted-foreground">
                <Calendar className="w-4 h-4" />
                <span>Créé le {createdAt}</span>
              </div>
            )}
          </div>

          {group.tags && Array.isArray(group.tags) && group.tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {group.tags.map((tag: string, idx: number) => (
                <span
                  key={idx}
                  className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-primary/10 text-primary border border-primary/20"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}

          {group.description && (
            <div className="prose prose-neutral dark:prose-invert max-w-none">
              <h2 className="text-xl font-semibold mb-3">Description</h2>
              <p className="text-muted-foreground whitespace-pre-wrap">
                {group.description}
              </p>
            </div>
          )}

          <div className="flex gap-4 pt-4">
            <Button size="lg">Rejoindre le groupe</Button>
            <Button variant="outline" size="lg">
              Partager
            </Button>
          </div>
        </div>
      </div>
    </main>
  );
}
