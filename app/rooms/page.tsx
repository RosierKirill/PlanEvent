import { RoomGrid } from "@/components/room-grid";
import * as React from "react";

export default function RoomsPage() {
  return (
    <main className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Salles</h1>
      <React.Suspense fallback={<div>Chargement des salles...</div>}>
        <RoomGrid />
      </React.Suspense>
    </main>
  );
}
