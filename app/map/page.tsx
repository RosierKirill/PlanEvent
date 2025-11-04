import { EventMap } from "@/components/event-map";

export default function MapPage() {
  return (
    <main className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Carte des événements</h1>
        <p className="text-muted-foreground">
          Découvrez tous les événements sur une carte interactive
        </p>
      </div>
      <EventMap />
    </main>
  );
}
