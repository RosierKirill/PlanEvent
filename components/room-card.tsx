"use client";

import { Card } from "@/components/ui/card";
import Link from "next/link";

interface RoomCardProps {
  room: {
    id: string;
    name?: string;
    user_id: string;
    event_id: string;
    // Optional display fields that may come from API
    location?: string | null;
    members?: number | null;
    description?: string | null;
    image?: string | null;
    rating?: number | null;
    isMember?: boolean | null;
  };
  onJoin?: (roomId: string) => void;
  onLeave?: (roomId: string) => void;
  joiningId?: string | null;
}

export function RoomCard({ room, onJoin, onLeave, joiningId }: RoomCardProps) {
  const title = room.name || "Salle sans titre";
  const locationText = room.location || "Lieu inconnu";
  const members = typeof room.members === "number" ? room.members : 0;
  const description = room.description || "";
  const image = room.image || "/placeholder.svg";

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
      <div className="flex gap-4 p-4">
        {/* Image */}
        <div className="shrink-0">
          <Link href={`/rooms/${room.id}`}>
            <img
              src={image}
              alt={title}
              className="h-32 w-44 rounded-lg object-cover"
              onError={(e) => {
                const target = e.currentTarget as HTMLImageElement;
                if (target.src !== location.origin + "/placeholder.svg") {
                  target.src = "/placeholder.svg";
                }
              }}
            />
          </Link>
        </div>

        {/* Content */}
        <div className="flex flex-1 flex-col justify-between bg-accent/50 rounded-lg p-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-sm text-muted-foreground">
                {locationText}
              </span>
            </div>
            <h3 className="text-lg font-semibold mb-2">
              <Link href={`/rooms/${room.id}`} className="hover:underline">
                {title}
              </Link>
            </h3>
            {description ? (
              <p className="text-sm text-muted-foreground line-clamp-2">
                {description}
              </p>
            ) : null}
          </div>

          {/* Members */}
          <div className="flex items-center justify-between gap-2 mt-4">
            <span className="text-sm font-medium">{members} membres</span>
            {/* Actions: join if not member; else access/leave */}
            <div className="flex items-center gap-2">
              {room.isMember ? (
                <>
                  <Link
                    href={`/rooms/${room.id}`}
                    className="px-3 py-1.5 rounded-md border hover:bg-accent text-sm"
                  >
                    Accéder
                  </Link>
                  {onLeave ? (
                    <button
                      onClick={() => onLeave(room.id)}
                      disabled={joiningId === room.id}
                      className="px-3 py-1.5 rounded-md bg-destructive text-destructive-foreground text-sm disabled:opacity-50"
                    >
                      {joiningId === room.id ? "..." : "Quitter"}
                    </button>
                  ) : null}
                </>
              ) : (
                onJoin && (
                  <button
                    onClick={() => onJoin(room.id)}
                    disabled={joiningId === room.id}
                    className="px-3 py-1.5 rounded-md border hover:bg-accent text-sm disabled:opacity-50"
                  >
                    {joiningId === room.id ? "..." : "Rejoindre"}
                  </button>
                )
              )}
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}
