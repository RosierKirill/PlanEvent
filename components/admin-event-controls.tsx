"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import * as React from "react";
import { useIsAdmin } from "@/hooks/use-is-admin";
import { useAuthToken } from "@/hooks/use-auth";

interface Props {
  eventId: string | number;
}

export function AdminEventControls({ eventId }: Props) {
  const isAdmin = useIsAdmin();
  const token = useAuthToken();
  const router = useRouter();

  const [deleting, setDeleting] = React.useState(false);
  const onDelete = async () => {
    if (!isAdmin) return;
    if (!confirm("Supprimer cet événement ?")) return;
    setDeleting(true);
    try {
      const headers: Record<string, string> = {};
      if (token) headers["authorization"] = `Bearer ${token}`;
      const res = await fetch(`/api/events/${eventId}`, { method: "DELETE", headers });
      if (!res.ok) {
        const txt = await res.text();
        throw new Error(txt || `Erreur ${res.status}`);
      }
      router.push("/events");
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
        href={`/events/${eventId}/edit`}
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

