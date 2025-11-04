"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import * as React from "react";
import { useIsAdmin } from "@/hooks/use-is-admin";
import { useAuthToken } from "@/hooks/use-auth";

interface Props {
  roomId: string | number;
  eventId?: string | number;
}

export function AdminRoomControls({ roomId, eventId }: Props) {
  const isAdmin = useIsAdmin();
  const token = useAuthToken();
  const router = useRouter();

  const [deleting, setDeleting] = React.useState(false);
  const onDelete = async () => {
    if (!isAdmin) return;
    if (!confirm("Supprimer ce groupe ?")) return;
    setDeleting(true);
    try {
      const headers: Record<string, string> = {};
      if (token) headers["authorization"] = `Bearer ${token}`;
      const res = await fetch(`/api/rooms/${roomId}`, { method: "DELETE", headers });
      if (!res.ok) {
        const txt = await res.text();
        throw new Error(txt || `Erreur ${res.status}`);
      }
      if (eventId) router.push(`/events/${eventId}`);
      else router.push(`/rooms`);
    } catch (e) {
      alert((e as any)?.message || "Suppression impossible");
    } finally {
      setDeleting(false);
    }
  };

  if (!isAdmin) return null;

  return (
    <div className="flex gap-2">
      <Link
        href={`/rooms/${roomId}/edit`}
        className="px-3 py-1.5 rounded-md border hover:bg-accent"
      >
        Modifier
      </Link>
      <button
        onClick={onDelete}
        disabled={deleting}
        className="px-3 py-1.5 rounded-md bg-destructive text-destructive-foreground disabled:opacity-50"
      >
        {deleting ? "Suppression..." : "Supprimer"}
      </button>
    </div>
  );
}

