import { RoomGrid } from "@/components/room-grid";
import { AdminCreateRoomButton } from "@/components/admin-create-room-button";
import * as React from "react";

export default function RoomsPage() {
  return (
    <main className="container mx-auto px-4 py-8">
      <AdminCreateRoomButton />
      <React.Suspense fallback={<div>Chargement des groupes...</div>}>
        <RoomGrid />
      </React.Suspense>
    </main>
  );
}
