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
import { Loader2, Plus, Users } from "lucide-react";
import { useEffect, useState } from "react";

interface Room {
  id: string;
  name: string;
  user_id: string;
  event_id: string;
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

export function EventRoomsDialog({ eventId, children }: EventRoomsDialogProps) {
  const [open, setOpen] = useState(false);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  const [newRoomName, setNewRoomName] = useState("");
  const [error, setError] = useState<string | null>(null);

  const fetchRooms = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/rooms/event/${eventId}`);
      if (!response.ok)
        throw new Error("Erreur lors du chargement des groupes");
      const data: RoomsResponse = await response.json();
      setRooms(data.items || []);
    } catch (err) {
      setError("Impossible de charger les groupes");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const createRoom = async () => {
    if (!newRoomName.trim()) return;

    const token = localStorage.getItem("token");
    if (!token) {
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
          event_id: eventId,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Erreur lors de la création");
      }

      setNewRoomName("");
      await fetchRooms();
    } catch (err: any) {
      setError(err.message || "Impossible de créer le groupe");
      console.error(err);
    } finally {
      setCreating(false);
    }
  };

  useEffect(() => {
    if (open) {
      fetchRooms();
    }
  }, [open, eventId]);

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
            </CardContent>
          </Card>

          {/* Liste des groupes existants */}
          <div>
            <h3 className="text-m font-medium mb-3">
              Groupes existants ({rooms.length})
            </h3>
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
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
                  <Card
                    key={room.id}
                    className="hover:border-primary transition-colors"
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Users className="h-5 w-5 text-muted-foreground" />
                          <div>
                            <p className="font-medium">{room.name}</p>
                          </div>
                        </div>
                        <Button size="sm" variant="outline">
                          Rejoindre
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
