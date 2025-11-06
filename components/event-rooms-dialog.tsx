"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/use-auth";
import { useRoomMembership } from "@/hooks/use-room-membership";
import { Loader2, LogIn, Plus, Users } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import useSWR from "swr";

interface Room {
  id: string;
  name: string;
  user_id: string;
  description: string;
  event_id: string;
  isMember?: boolean;
}

interface RoomsResponse {
  items: Room[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

interface EventRoomsDialogProps {
  eventId: string;
  children: React.ReactNode;
}

// Fetcher function for SWR
async function fetchEventRooms(url: string): Promise<Room[]> {
  const response = await fetch(url);
  if (!response.ok) throw new Error("Erreur lors du chargement des groupes");
  const data: RoomsResponse = await response.json();
  return data.items || [];
}

// Component to render a room card with lazy-loaded membership status
function RoomCardWithMembership({
  room,
  joiningRoomId,
  onJoin,
  onLeave,
}: {
  room: Room;
  joiningRoomId: string | null;
  onJoin: (roomId: string) => void;
  onLeave: (roomId: string) => void;
}) {
  const { token, isAuthenticated, user } = useAuth();
  const { isMember, isLoading } = useRoomMembership(
    room.id,
    isAuthenticated ? token : null,
    isAuthenticated ? user?.id ?? null : null
  );

  return (
    <Card className="hover:border-primary transition-colors">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Users className="h-5 w-5 text-muted-foreground" />
            <div>
              <p className="font-medium">{room.name}</p>
              <p className="text-sm text-muted-foreground">
                {room.description}
              </p>
            </div>
          </div>
          {!isAuthenticated ? (
            <Button size="sm" variant="outline" asChild>
              <Link href="/login">
                <LogIn className="mr-2 h-4 w-4" />
                Se connecter
              </Link>
            </Button>
          ) : isLoading ? (
            <Button size="sm" variant="outline" disabled>
              <Loader2 className="h-4 w-4 animate-spin" />
            </Button>
          ) : isMember ? (
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="destructive"
                onClick={() => onLeave(room.id)}
                disabled={joiningRoomId === room.id}
              >
                {joiningRoomId === room.id ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  "Quitter"
                )}
              </Button>
              <Button size="sm" variant="default" asChild>
                <Link href={`/rooms/${room.id}`}>Accéder</Link>
              </Button>
            </div>
          ) : (
            <Button
              size="sm"
              variant="outline"
              onClick={() => onJoin(room.id)}
              disabled={joiningRoomId === room.id}
            >
              {joiningRoomId === room.id ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                "Rejoindre"
              )}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export function EventRoomsDialog({ eventId, children }: EventRoomsDialogProps) {
  const [open, setOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [newRoomName, setNewRoomName] = useState("");
  const [newRoomDescription, setNewRoomDescription] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [joiningRoomId, setJoiningRoomId] = useState<string | null>(null);
  const { token, isAuthenticated, user } = useAuth();

  // Use SWR to fetch and cache rooms for this event
  const {
    data: rooms = [],
    error: fetchError,
    isLoading,
    mutate,
  } = useSWR<Room[]>(
    open ? `/api/rooms/event/${eventId}` : null,
    fetchEventRooms,
    {
      revalidateOnFocus: false,
      dedupingInterval: 30000, // Cache for 30 seconds
    }
  );

  const createRoom = async () => {
    if (!newRoomName.trim()) return;

    if (!isAuthenticated || !token) {
      setError("Vous devez être connecté pour créer un groupe");
      return;
    }

    setCreating(true);
    setError(null);
    try {
      const response = await fetch("/api/rooms", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: newRoomName,
          description: newRoomDescription,
          event_id: eventId,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Erreur lors de la création");
      }

      setNewRoomName("");
      setNewRoomDescription("");
      mutate(); // Revalidate rooms list
    } catch (err: any) {
      setError(err.message || "Impossible de créer le groupe");
      console.error(err);
    } finally {
      setCreating(false);
    }
  };

  const joinRoom = async (roomId: string) => {
    if (!isAuthenticated || !token || !user?.id) {
      setError("Vous devez être connecté pour rejoindre un groupe");
      console.error("Missing auth data:", {
        isAuthenticated,
        hasToken: !!token,
        user,
      });
      return;
    }

    setJoiningRoomId(roomId);
    setError(null);
    try {
      const response = await fetch("/api/room-members", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          room_id: roomId,
          user_id: user.id,
        }),
      });

      if (!response.ok) {
        let errorMessage = "Erreur lors de l'ajout au groupe";
        try {
          const errorData = await response.json();
          console.error("Error response:", errorData);
          errorMessage =
            errorData.error ||
            errorData.message ||
            errorData.detail ||
            errorMessage;
        } catch (e) {
          const errorText = await response.text();
          console.error("Error response (text):", errorText);
          errorMessage = errorText || errorMessage;
        }
        throw new Error(errorMessage);
      }

      mutate(); // Revalidate rooms list and membership
    } catch (err: any) {
      setError(err.message || "Impossible de rejoindre le groupe");
      console.error("Join room error:", err);
    } finally {
      setJoiningRoomId(null);
    }
  };

  const leaveRoom = async (roomId: string) => {
    if (!isAuthenticated || !token) {
      setError("Vous devez être connecté pour quitter un groupe");
      return;
    }

    setJoiningRoomId(roomId);
    setError(null);
    try {
      const response = await fetch(`/api/room-members/leave/${roomId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        let errorMessage = "Erreur lors de la sortie du groupe";
        try {
          const errorData = await response.json();
          console.error("Error response:", errorData);
          errorMessage =
            errorData.error ||
            errorData.message ||
            errorData.detail ||
            errorMessage;
        } catch (e) {
          const errorText = await response.text();
          console.error("Error response (text):", errorText);
          errorMessage = errorText || errorMessage;
        }
        throw new Error(errorMessage);
      }

      mutate(); // Revalidate rooms list and membership
    } catch (err: any) {
      setError(err.message || "Impossible de quitter le groupe");
      console.error("Leave room error:", err);
    } finally {
      setJoiningRoomId(null);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Rejoindre ou créer un groupe</DialogTitle>
          <DialogDescription>
            Choisissez un groupe existant ou créez-en un nouveau pour cet
            événement
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          {/* Formulaire de création */}
          <Card>
            <CardHeader>
              <CardTitle className="text-l flex items-center gap-2">
                <Plus className="h-5 w-5" />
                Créer un nouveau groupe
              </CardTitle>
            </CardHeader>
            <CardContent>
              {!isAuthenticated ? (
                <div className="text-center py-4 space-y-3">
                  <p className="text-sm text-muted-foreground">
                    Vous devez être connecté pour créer un groupe
                  </p>
                  <Button asChild variant="default" size="sm">
                    <Link href="/login">
                      <LogIn className="mr-2 h-4 w-4" />
                      Se connecter
                    </Link>
                  </Button>
                </div>
              ) : (
                <div className="flex gap-2">
                  <Input
                    placeholder="Nom du groupe"
                    value={newRoomName}
                    onChange={(e) => setNewRoomName(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") createRoom();
                    }}
                    disabled={creating}
                  />
                  <Input
                    type="text"
                    placeholder="Description du groupe"
                    value={newRoomDescription}
                    onChange={(e) => setNewRoomDescription(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") createRoom();
                    }}
                    disabled={creating}
                  />
                  <Button
                    onClick={createRoom}
                    disabled={creating || !newRoomName.trim()}
                  >
                    {creating ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      "Créer"
                    )}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Liste des groupes existants */}
          <div>
            <h3 className="text-m font-medium mb-3">
              Groupes existants ({rooms.length})
            </h3>
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : fetchError ? (
              <div className="text-sm text-destructive text-center py-4">
                {fetchError.message || "Impossible de charger les groupes"}
              </div>
            ) : error ? (
              <div className="text-sm text-destructive text-center py-4">
                {error}
              </div>
            ) : rooms.length === 0 ? (
              <div className="text-sm text-muted-foreground text-center py-8 border rounded-lg">
                Aucun groupe pour le moment. Soyez le premier à en créer un !
              </div>
            ) : (
              <div className="grid gap-3">
                {rooms.map((room) => (
                  <RoomCardWithMembership
                    key={room.id}
                    room={room}
                    joiningRoomId={joiningRoomId}
                    onJoin={joinRoom}
                    onLeave={leaveRoom}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
