"use client";

import { Button } from "@/components/ui/button";
import { EventRoomsDialog } from "@/components/event-rooms-dialog";
import { Ticket } from "lucide-react";

interface ParticipateButtonProps {
  eventId: string;
}

export function ParticipateButton({ eventId }: ParticipateButtonProps) {
  return (
    <EventRoomsDialog eventId={eventId}>
      <Button className="w-full" size="lg">
        <Ticket className="mr-2 h-4 w-4" />
        Je participe
      </Button>
    </EventRoomsDialog>
  );
}
