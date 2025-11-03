import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

async function fetchEvent(id: number) {
  const base = process.env.API_BASE || process.env.NEXT_PUBLIC_API_BASE || "";
  const url = `${String(base).replace(/\/$/, "")}/events/${id}`;
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
  const id = Number(resolvedParams.id);
  const event = await fetchEvent(id);

  if (!event) return notFound();

  return (
    <main className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <Link href="/events" className="text-sm text-primary hover:underline">
          ← Retour aux événements
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <h1 className="text-3xl font-bold mb-2">{event.title}</h1>
          <div className="text-sm text-muted-foreground mb-4">
            {event.date} — {event.location}
          </div>
          <div className="mb-4">
            <Image
              src={event.image || "/placeholder.svg"}
              alt={event.title}
              width={800}
              height={400}
              className="rounded-lg object-cover w-full h-64"
            />
          </div>
          <p className="text-base leading-relaxed">{event.description}</p>
          <div className="flex gap-2 mt-4">
            {(event.tags ?? [])
              .filter(
                (t: any) => typeof t === "string" || typeof t === "number"
              )
              .map((t: string | number) => (
                <span
                  key={t}
                  className="text-xs px-2 py-1 rounded-full bg-secondary text-muted-foreground"
                >
                  #{t}
                </span>
              ))}
          </div>
        </div>

        <aside className="md:col-span-1">
          <div className="p-4 border rounded-lg">
            <div className="text-sm text-muted-foreground">Participants</div>
            <div className="text-2xl font-semibold mt-2">
              {event.attendees ?? 0}
            </div>
            <div className="mt-4">
              <button className="w-full bg-primary text-primary-foreground py-2 rounded-md">
                Je participe
              </button>
            </div>
          </div>
        </aside>
      </div>
    </main>
  );
}
