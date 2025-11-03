import { RoomGrid } from "@/components/room-grid";
import * as React from "react";

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">
          Salles Musique à proximité de Lyon, FR
        </h1>
        <React.Suspense fallback={<div>Chargement des salles...</div>}>
          <RoomGrid />
        </React.Suspense>
      </main>
    </div>
  );
}
