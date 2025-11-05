import GroupsList from "@/components/groups-list";
import * as React from "react";

export default function GroupsPage() {
  return (
    <main className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Groupes</h1>
        <p className="text-muted-foreground">
          Découvrez et rejoignez des groupes pour partager vos passions
        </p>
      </div>

      <React.Suspense fallback={<div>Chargement des groupes...</div>}>
        <GroupsList />
      </React.Suspense>
    </main>
  );
}
