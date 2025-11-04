"use client";

import { Card } from "@/components/ui/card";
import { MapPin } from "lucide-react";
import Link from "next/link";

interface RoomCardProps {
  room: {
    id: string;
    name?: string;
    user_id: string;
    events: {
      id: string;
      name: string;
      location?: string | null;
      date?: string | null;
    };
    // Optional display fields that may come from API
    room_members?: Array<object>;
    description?: string | null;
    isMember?: boolean | null;
  };
  onJoin?: (roomId: string) => void;
  onLeave?: (roomId: string) => void;
  joiningId?: string | null;
}

export function RoomCard({ room, onJoin, onLeave, joiningId }: RoomCardProps) {
  const title = room.name || "Salle sans titre";
  const eventName = room.events.name || "Aucun événement";
  const members = room.room_members?.length ?? 0;
  const description = room.description || "";

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow p-1">
      <div className="flex gap-4 p-0 px-2">
        {/* Content */}
        <div className="flex flex-1 flex-col justify-between rounded-lg p-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">{eventName}</span>
            </div>
            <h3 className="text-lg font-semibold mb-2">
              <Link href={`/rooms/${room.id}`} className="hover:underline">
                {title}
              </Link>
            </h3>
            <p className="text-sm text-muted-foreground line-clamp-2 h-4">
              {description}
            </p>
          </div>

          {/* Members */}
          <div className="flex items-center justify-between gap-2 mt-4">
            <span className="text-sm font-medium">{members} membre(s)</span>
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
