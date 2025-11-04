"use client";

import Link from "next/link";
import { useIsAdmin } from "@/hooks/use-is-admin";

export function AdminCreateEventButton() {
  const isAdmin = useIsAdmin();
  if (!isAdmin) return null;
  return (
    <div className="mb-4 flex justify-end">
      <Link
        href="/events/new"
        className="inline-flex items-center px-4 py-2 rounded-md bg-primary text-primary-foreground hover:opacity-90"
      >
        Créer un événement
      </Link>
    </div>
  );
}

