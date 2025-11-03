"use client";

import { Button } from "@/components/ui/button";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { ChevronRight, Cpu, Music, Sparkles, Users } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import * as React from "react";

const iconMap: Record<string, any> = {
  music: Music,
  "post-punk": Music,
  jazz: Music,
  community: Users,
  workshop: Sparkles,
  production: Cpu,
  nightlife: Sparkles,
  indie: Music,
};

export function CategoryFilter() {
  const [tags, setTags] = React.useState<Array<{ id: string; label: string }>>(
    []
  );
  const [loading, setLoading] = React.useState(true);
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const activeTag = searchParams?.get("tag");

  React.useEffect(() => {
    setLoading(true);
    const url = `/api/tags`;
    const token =
      typeof window !== "undefined" ? localStorage.getItem("token") : null;
    const headers: Record<string, string> = {};
    if (token) headers["authorization"] = `Bearer ${token}`;

    fetch(url, { headers })
      .then(async (res) => {
        const ct = res.headers.get("content-type") || "";
        const text = await res.text();
        if (!res.ok) throw new Error(`Erreur ${res.status}: ${text}`);
        if (!ct.includes("application/json"))
          throw new Error("Réponse non JSON du serveur");
        return JSON.parse(text);
      })
      .then((data) => {
        setTags(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  function onSelect(tagId?: string) {
    const params = new URLSearchParams(Array.from(searchParams || []));
    if (!tagId) {
      params.delete("tag");
    } else {
      params.set("tag", tagId);
    }
    const qs = params.toString();
    router.push(qs ? `${pathname}?${qs}` : pathname);
  }

  if (loading) return <div className="mb-8">Chargement des catégories...</div>;

  return (
    <div className="mb-8">
      <ScrollArea className="w-full whitespace-nowrap">
        <div className="flex gap-4 pb-4">
          <Button
            variant="ghost"
            onClick={() => onSelect(undefined)}
            className={`flex flex-col items-center gap-2 h-auto py-3 px-4 min-w-[100px] ${
              !activeTag ? "border-b-2 border-primary" : ""
            }`}
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-secondary">
              <Sparkles className="h-5 w-5" />
            </div>
            <span className="text-xs text-center">Tous</span>
          </Button>

          {tags.map((t) => {
            const Icon = iconMap[t.id] || Sparkles;
            const isActive = activeTag === t.id;
            return (
              <Button
                key={t.id}
                variant="ghost"
                onClick={() => onSelect(t.id)}
                className={`flex flex-col items-center gap-2 h-auto py-3 px-4 min-w-[100px] ${
                  isActive ? "border-b-2 border-primary" : ""
                }`}
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-secondary">
                  <Icon className="h-5 w-5" />
                </div>
                <span className="text-xs text-center">{t.label}</span>
              </Button>
            );
          })}

          <Button
            variant="ghost"
            className="flex flex-col items-center gap-2 h-auto py-3 px-4 min-w-[100px]"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary">
              <ChevronRight className="h-5 w-5 text-primary-foreground" />
            </div>
          </Button>
        </div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
    </div>
  );
}
