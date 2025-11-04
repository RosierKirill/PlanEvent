import { EventTagFilter } from "@/components/event-tag-filter";
import EventsList from "@/components/events-list";
import * as React from "react";

export default function EventsPage() {
  return (
    <main className="container mx-auto px-4 py-8">
      <React.Suspense fallback={<div>Chargement...</div>}>
        <EventTagFilter />
      </React.Suspense>
      <React.Suspense fallback={<div>Chargement des événements...</div>}>
        <EventsList />
      </React.Suspense>
    </main>
  );
}
