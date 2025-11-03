"use client";
import { RoomCard } from "@/components/room-card";
import { useSearchParams } from "next/navigation";
import * as React from "react";

export function RoomGrid() {
  const [rooms, setRooms] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  const searchParams = useSearchParams();
  const q = searchParams?.get("q");

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
        return JSON.parse(text);
      })
      .then((data) => {
        setRooms(data.items);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, [q]);

  if (loading) return <div>Chargement des salles...</div>;
  if (error) return <div className="text-red-500">Erreur : {error}</div>;
  if (rooms.length === 0) return <div>Aucune salle trouvée.</div>;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {rooms.map((room) => (
        <RoomCard key={room.id} room={room} />
      ))}
    </div>
  );
}
