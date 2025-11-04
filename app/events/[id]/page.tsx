import { EventMiniMap } from "@/components/event-mini-map";
import { ParticipateButton } from "@/components/participate-button";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ArrowLeft, Calendar, Clock, MapPin, Users } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AdminEventControls } from "@/components/admin-event-controls";

async function fetchEvent(id: string) {
  const base = process.env.API_BASE || process.env.NEXT_PUBLIC_API_BASE || "";
  const url = `${String(base).replace(/\/$/, "")}/events/${encodeURIComponent(
    id
  )}`;
  const res = await fetch(url);
  if (!res.ok) return null;
  return res.json();
}

interface Props {
  params: any;
}

export default async function EventPage({ params }: Props) {
  // In Next.js App Router params can be a Promise in some runtimes — unwrap it safely
  const resolvedParams = await params;
  const id = resolvedParams.id;
  const event = await fetchEvent(id);

  if (!event) return notFound();

  return (
    <main className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/events">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Retour aux événements
            </Link>
          </Button>
          <AdminEventControls eventId={id} />
        </div>
      </div>

      <h2 className="text-2xl font-bold leading-relaxed text-muted-foreground p-2">
        {event.name}
      </h2>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          {/* Image principale */}
          <div className="relative w-full h-[400px] rounded-xl overflow-hidden shadow-lg">
            <Image
              src={event.image || "/event.png"}
              alt={event.title || "Image de l'événement"}
              fill
              className="object-cover"
              priority
            />
          </div>
          {event.tags && Array.isArray(event.tags) && event.tags.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {event.tags.map((tag: string, idx: number) => (
                <span
                  key={idx}
                  className="inline-flex items-center px-2.5 py-0.5 rounded-full text-s font-medium bg-primary/10 text-primary border border-primary/20"
                >
                  {tag}
                </span>
              ))}
            </div>
          ) : null}
        </div>

        {/* Sidebar */}
        <aside className="lg:col-span-1 space-y-6">
          {/* Carte Participants */}
          <Card>
            <CardHeader>
              <CardDescription className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                Participants
              </CardDescription>
              <CardTitle className="text-3xl">{event.total_participants ?? event.attendees ?? 0}</CardTitle>
            </CardHeader>
            <CardContent>
              <ParticipateButton eventId={id} />
            </CardContent>
          </Card>

          {/* Informations supplémentaires */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Informations pratiques</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-start gap-3">
                <Calendar className="h-5 w-5 text-muted-foreground mt-1" />
                <div>
                  <p className="text-sm font-medium">Date</p>
                  <p className="text-sm text-muted-foreground">
                    {new Date(event.start_date).toLocaleString("fr-FR", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                      hour: "numeric",
                      minute: "numeric",
                    })}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <MapPin className="h-5 w-5 text-muted-foreground mt-1" />
                <div>
                  <p className="text-sm font-medium">Lieu</p>
                  <p className="text-sm text-muted-foreground">
                    {event.location}
                  </p>
                </div>
              </div>

              {/* Mini carte de localisation */}
              <EventMiniMap location={event.location} name={event.name} />

              {event.time && (
                <div className="flex items-start gap-3">
                  <Clock className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-sm font-medium">Heure</p>
                    <p className="text-sm text-muted-foreground">
                      {event.time}
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </aside>
      </div>
    </main>
  );
}
