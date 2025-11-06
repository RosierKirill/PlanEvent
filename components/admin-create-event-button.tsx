"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/hooks/use-auth";
import { useIsAdmin } from "@/hooks/use-is-admin";
import Link from "next/link";

export function AdminCreateEventButton() {
  const { isLoading } = useAuth();
  const isAdmin = useIsAdmin();

  if (isLoading) {
    return (
      <div className="mb-4 flex justify-end">
        <Skeleton className="h-10 w-44" />
      </div>
    );
  }

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
