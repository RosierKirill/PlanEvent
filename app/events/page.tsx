import * as React from "react"
import EventsList from "@/components/events-list"

export default function EventsPage() {
  return (
    <main className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Événements</h1>
      <React.Suspense fallback={<div>Chargement des événements...</div>}>
        <EventsList />
      </React.Suspense>
    </main>
  )
}