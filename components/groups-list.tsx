"use client";
import { useAuthToken } from "@/hooks/use-auth";
import { Users, Calendar } from "lucide-react";
import { useSearchParams } from "next/navigation";
import * as React from "react";
import { Pagination } from "@/components/pagination";

interface GroupsListProps {
  limit?: number;
}

interface PaginationData {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

interface Group {
  id: string;
  name: string;
  description?: string;
  created_at?: string;
  member_count?: number;
  image_url?: string;
  tags?: string[];
}

export default function GroupsList({ limit }: GroupsListProps) {
  const [groups, setGroups] = React.useState<Group[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [pagination, setPagination] = React.useState<PaginationData | null>(null);
  const [currentPage, setCurrentPage] = React.useState(1);

  const searchParams = useSearchParams();
  const q = searchParams?.get("q");
  const token = useAuthToken();

  React.useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (q) params.set("q", q);

    // Si on a une limite, on ne pagine pas (mode "home" avec limite)
    if (!limit) {
      params.set("page", String(currentPage));
      params.set("limit", "9"); // 9 groupes par page (3 lignes de 3)
    }

    const url = `/api/groups${
      params.toString() ? `?${params.toString()}` : ""
    }`;

    const headers: Record<string, string> = {};
    if (token) headers["authorization"] = `Bearer ${token}`;

    fetch(url, { headers })
      .then(async (res) => {
        const ct = res.headers.get("content-type") || "";
        const text = await res.text();

        if (!res.ok) throw new Error(`Erreur ${res.status}: ${text}`);
        if (!ct.includes("application/json"))
          throw new Error("Réponse non JSON du serveur");

        try {
          return JSON.parse(text);
        } catch (e: any) {
          console.error("JSON parse error:", e);
          throw new Error(`Impossible de parser la réponse JSON: ${e.message}`);
        }
      })
      .then((data) => {
        let list: Group[] = [];
        let paginationData: PaginationData | null = null;

        if (Array.isArray(data)) {
          list = data;
        } else if (data && typeof data === "object") {
          list = data.groups || data.data || data.items || data.results || [];

          // Extract pagination info if available
          if (data.pagination) {
            paginationData = data.pagination;
          }
        }

        if (!Array.isArray(list)) {
          console.error("Expected array but got:", typeof list, list);
          throw new Error("Format de réponse inattendu pour les groupes");
        }

        // Client-side filtering if backend doesn't filter by `q`
        let filtered = list;
        if (!paginationData && q && typeof q === "string" && q.trim()) {
          const needle = q.trim().toLowerCase();
          filtered = filtered.filter((group: Group) => {
            const name = String(group.name || "").toLowerCase();
            const desc = String(group.description || "").toLowerCase();
            return name.includes(needle) || desc.includes(needle);
          });
        }

        // Apply limit if specified (mode home)
        const finalGroups = limit ? filtered.slice(0, limit) : filtered;

        setGroups(finalGroups);
        setPagination(paginationData);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, [q, limit, currentPage, token]);

  if (loading) return <div>Chargement des groupes...</div>;
  if (error) return <div className="text-red-500">Erreur : {error}</div>;

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {groups.map((group) => {
          const imageUrl = group.image_url || "/group-placeholder.png";
          const createdAt = group.created_at
            ? new Date(group.created_at).toLocaleDateString()
            : "";

          return (
            <a
              key={group.id}
              href={`/groups/${group.id}`}
              className="flex overflow-hidden border rounded-xl bg-card hover:shadow-xl hover:scale-[1.02] hover:border-primary/50 transition-all duration-300 ease-out"
            >
              <div className="shrink-0 w-40 h-full relative bg-muted">
                <img
                  src={imageUrl}
                  alt={group.name}
                  className="absolute inset-0 w-full h-full object-cover"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = "none";
                  }}
                />
              </div>

              <div className="flex-1 p-6">
                <h3 className="text-xl font-bold mb-4">{group.name}</h3>

                {group.description && (
                  <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                    {group.description}
                  </p>
                )}

                <div className="space-y-2">
                  {group.member_count !== undefined && (
                    <div className="flex items-center gap-2 text-sm">
                      <Users className="w-4 h-4 text-muted-foreground" />
                      <span>
                        {group.member_count}{" "}
                        {group.member_count <= 1 ? "membre" : "membres"}
                      </span>
                    </div>
                  )}

                  {createdAt && (
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="w-4 h-4 text-muted-foreground" />
                      <span>Créé le {createdAt}</span>
                    </div>
                  )}
                </div>

                {group.tags && Array.isArray(group.tags) && group.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-4">
                    {group.tags.map((tag: string, idx: number) => (
                      <span
                        key={idx}
                        className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary border border-primary/20"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </a>
          );
        })}
      </div>

      {!limit && pagination && pagination.pages > 1 && (
        <Pagination
          currentPage={currentPage}
          totalPages={pagination.pages}
          onPageChange={setCurrentPage}
        />
      )}
    </>
  );
}
