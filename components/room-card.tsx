"use client";

import { Card } from "@/components/ui/card";
import { Star } from "lucide-react";

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
  };
}

export function RoomCard({ room }: RoomCardProps) {
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
        </div>

        {/* Content */}
        <div className="flex flex-1 flex-col justify-between bg-accent/50 rounded-lg p-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-sm text-muted-foreground">
                {locationText}
              </span>
            </div>
            <h3 className="text-lg font-semibold mb-2">{title}</h3>
            {description ? (
              <p className="text-sm text-muted-foreground line-clamp-2">
                {description}
              </p>
            ) : null}
          </div>

          {/* Members */}
          <div className="flex items-center gap-2 mt-4">
            <span className="text-sm font-medium">{members} membres</span>
          </div>
        </div>
      </div>
    </Card>
  );
}
