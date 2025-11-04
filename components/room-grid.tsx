"use client";
import { RoomCard } from "@/components/room-card";
import { useSearchParams } from "next/navigation";
import * as React from "react";
import { useAuth } from "@/hooks/use-auth";

export function RoomGrid() {
  const [rooms, setRooms] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  const searchParams = useSearchParams();
  const q = searchParams?.get("q");

  const { token, isAuthenticated, user } = useAuth();

  React.useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    const url = `/api/rooms${params.toString() ? `?${params.toString()}` : ""}`;
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
        try {
          return JSON.parse(text);
        } catch (e: any) {
          throw new Error(`Impossible de parser la réponse JSON: ${e.message}`);
        }
      })
      .then(async (data) => {
        // Normalize: Array | { rooms } | { data } | { items } | { results }
        let list: any[] = [];
        if (Array.isArray(data)) list = data;
        else if (data && typeof data === "object") {
          list = (data.rooms ||
            data.data ||
            data.items ||
            data.results ||
            []) as any[];
        }

        if (!Array.isArray(list)) {
          throw new Error("Format de réponse inattendu pour les salles");
        }

        if (isAuthenticated && token && user?.id) {
          const enriched = await Promise.all(
            list.map(async (room: any) => {
              try {
                const res = await fetch(`/api/room-members/check/${room.id}`, {
                  headers: token ? { authorization: `Bearer ${token}` } : {},
                });
                if (!res.ok) return { ...room, isMember: false };
                const data = await res.json();
                let isMember = false;
                if (Array.isArray(data?.members)) {
                  isMember = data.members.some((m: any) => {
                    const memberId = m.user_id || m.id;
                    return memberId === user.id;
                  });
                } else if (typeof data?.is_member === "boolean") {
                  isMember = data.is_member;
                }
                return { ...room, isMember };
              } catch {
                return { ...room, isMember: false };
              }
            })
          );
          setRooms(enriched);
        } else {
          setRooms(list);
        }
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, [q, isAuthenticated, token, user?.id]);

  const [joiningId, setJoiningId] = React.useState<string | null>(null);
  const onJoin = async (roomId: string) => {
    if (!isAuthenticated || !token || !user?.id) {
      setError("Vous devez être connecté pour rejoindre un groupe");
      return;
    }
    setJoiningId(roomId);
    try {
      const res = await fetch("/api/room-members", {
        method: "POST",
        headers: {
          "content-type": "application/json",
          authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ room_id: roomId, user_id: user.id }),
      });
      if (!res.ok) throw new Error(await res.text());
      setRooms((prev) => prev.map((r) => (r.id === roomId ? { ...r, isMember: true } : r)));
    } catch (e: any) {
      setError(e?.message || "Erreur lors de la jonction au groupe");
    } finally {
      setJoiningId(null);
    }
  };

  const onLeave = async (roomId: string) => {
    if (!isAuthenticated || !token) {
      setError("Vous devez être connecté pour quitter un groupe");
      return;
    }
    setJoiningId(roomId);
    try {
      const res = await fetch(`/api/room-members/leave/${roomId}`, {
        method: "DELETE",
        headers: { authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error(await res.text());
      setRooms((prev) => prev.map((r) => (r.id === roomId ? { ...r, isMember: false } : r)));
    } catch (e: any) {
      setError(e?.message || "Erreur lors de la sortie du groupe");
    } finally {
      setJoiningId(null);
    }
  };

  if (loading) return <div>Chargement des salles...</div>;
  if (error) return <div className="text-red-500">Erreur : {error}</div>;
  if (rooms.length === 0) return <div>Aucune salle trouvée.</div>;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {rooms.map((room) => (
        <RoomCard
          key={room.id}
          room={room}
          onJoin={onJoin}
          onLeave={onLeave}
          joiningId={joiningId}
        />
      ))}
    </div>
  );
}
