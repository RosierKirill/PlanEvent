import EventList from "@/components/events-list";
import * as React from "react";

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">
          Commencez votre aventure!
        </h1>
        <React.Suspense fallback={<div>Chargement des événements...</div>}>
          <EventList/>
        </React.Suspense>
      </main>
    </div>
  );
}
