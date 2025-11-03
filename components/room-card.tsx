"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import { Star } from "lucide-react";

interface RoomCardProps {
  room: {
    id: number;
    title: string;
    location: string;
    rating: number;
    description: string;
    members: number;
    image: string;
    memberAvatars: string[];
  };
}

export function RoomCard({ room }: RoomCardProps) {
  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
      <div className="flex gap-4 p-4">
        {/* Image */}
        <div className="shrink-0">
          <img
            src={room.image || "/placeholder.svg"}
            alt={room.title}
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
                {room.location}
              </span>
              <span className="text-sm">•</span>
              <div className="flex items-center gap-1">
                <span className="text-sm font-medium">{room.rating}</span>
                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
              </div>
            </div>
            <h3 className="text-lg font-semibold mb-2">{room.title}</h3>
            <p className="text-sm text-muted-foreground line-clamp-2">
              {room.description}
            </p>
          </div>

          {/* Members */}
          <div className="flex items-center gap-2 mt-4">
            <div className="flex -space-x-2">
              {room.memberAvatars.map((avatar, index) => (
                <Avatar
                  key={index}
                  className="h-8 w-8 border-2 border-background"
                >
                  <AvatarImage
                    src={avatar}
                    onError={(e) => {
                      const target = e.currentTarget as HTMLImageElement;
                      if (target.src !== location.origin + "/placeholder.svg") {
                        target.src = "/placeholder.svg";
                      }
                    }}
                  />
                  <AvatarFallback>M{index + 1}</AvatarFallback>
                </Avatar>
              ))}
            </div>
            <span className="text-sm font-medium">{room.members} members</span>
          </div>
        </div>
      </div>
    </Card>
  );
}
