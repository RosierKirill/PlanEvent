"use client";

import { RealtimeChat } from "@/components/realtime-chat";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useAuth } from "@/hooks/use-auth";
import { ArrowLeft, Calendar, Loader2, MapPin, Users } from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface Room {
  id: string;
  name: string;
  description: string;
  event_id: string;
  user_id: string;
  created_at: string;
}

interface Event {
  id: string;
  name: string;
  description: string;
  location: string;
  start_date: string;
  image?: string;
  tags?: string[];
}

interface Member {
  id: string;
  user_id?: string;
  email?: string;
  name?: string;
  username?: string;
  joined_at: string;
  user?: {
    id: string;
    email?: string;
    name?: string;
    username?: string;
  };
}

interface User {
  id: string;
  email?: string;
  name?: string;
  username?: string;
}

export default function RoomPage() {
  const params = useParams();
  const router = useRouter();
  const roomId = params.id as string;
  const { token, isAuthenticated, isLoading: authLoading, user } = useAuth();

  const [room, setRoom] = useState<Room | null>(null);
  const [event, setEvent] = useState<Event | null>(null);
  const [members, setMembers] = useState<Member[]>([]);
  const [users, setUsers] = useState<Map<string, User>>(new Map());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isMember, setIsMember] = useState(false);

  useEffect(() => {
    // Wait for auth to load before checking authentication
    if (authLoading) {
      return;
    }

    if (!isAuthenticated) {
      router.push("/login");
      return;
    }

    const fetchRoomData = async () => {
      setLoading(true);
      setError(null);

      try {
        // Fetch room details
        const roomResponse = await fetch(`/api/rooms/${roomId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!roomResponse.ok) {
          throw new Error("Groupe introuvable");
        }

        const roomData: Room = await roomResponse.json();
        setRoom(roomData);

        // Fetch event details
        const eventResponse = await fetch(`/api/events/${roomData.event_id}`);
        if (eventResponse.ok) {
          const eventData: Event = await eventResponse.json();
          setEvent(eventData);
        }

        // Fetch all users to get their names
        const usersResponse = await fetch(`/api/users?limit=1000`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const usersMap = new Map<string, User>();
        if (usersResponse.ok) {
          try {
            const usersData = await usersResponse.json();

            // Handle different response structures
            let usersList: User[] = [];
            if (Array.isArray(usersData)) {
              usersList = usersData;
            } else if (usersData.items && Array.isArray(usersData.items)) {
              usersList = usersData.items;
            } else if (usersData.users && Array.isArray(usersData.users)) {
              usersList = usersData.users;
            } else if (usersData.data && Array.isArray(usersData.data)) {
              usersList = usersData.data;
            }

            // Create a map for quick lookup
            usersList.forEach((u: User) => {
              usersMap.set(u.id, u);
            });
            setUsers(usersMap);
          } catch (e) {
            console.error("Error parsing users data:", e);
          }
        }

        // Check membership and fetch members
        const memberResponse = await fetch(
          `/api/room-members/check/${roomId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (memberResponse.ok) {
          try {
            const memberData = await memberResponse.json();

            // Extract members array
            const members =
              memberData.members && Array.isArray(memberData.members)
                ? memberData.members
                : [];

            setMembers(members);

            // Check if current user is in the members list
            if (user?.id) {
              const userIsMember = members.some((member: any) => {
                const memberId = member.user_id || member.id;
                return memberId === user.id;
              });
              setIsMember(userIsMember);
            } else {
              setIsMember(false);
            }
          } catch (e) {
            console.error("Error parsing room members data:", e);
            setMembers([]);
            setIsMember(false);
          }
        }
      } catch (err: any) {
        setError(err.message || "Erreur lors du chargement");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchRoomData();
  }, [roomId, token, isAuthenticated, authLoading, router, user?.id]);

  if (loading) {
    return (
      <main className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-12 w-12 animate-spin text-muted-foreground" />
        </div>
      </main>
    );
  }

  if (error || !room) {
    return (
      <main className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="mb-8">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/events">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Retour
            </Link>
          </Button>
        </div>
        <Card>
          <CardContent className="py-16 text-center">
            <p className="text-destructive">{error || "Groupe introuvable"}</p>
          </CardContent>
        </Card>
      </main>
    );
  }

  if (!isMember) {
    return (
      <main className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="mb-8">
          <Button variant="ghost" size="sm" asChild>
            <Link href={`/rooms`}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Retour aux salles
            </Link>
          </Button>
        </div>
        <Card>
          <CardContent className="py-16 text-center space-y-4">
            <p className="text-muted-foreground">
              Vous devez être membre de ce groupe pour y accéder
            </p>
            <Button asChild>
              <Link href={`/events/${room.event_id}`}>Rejoindre le groupe</Link>
            </Button>
          </CardContent>
        </Card>
      </main>
    );
  }

  return (
    <main className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="mb-8">
        <Button variant="ghost" size="sm" asChild>
          <Link href={`/rooms`}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Retour aux salles
          </Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-3xl">{room.name}</CardTitle>
              <CardDescription>{room.description}</CardDescription>
            </CardHeader>
          </Card>

          <Card className="py-0">
            {/* Real-time Chat */}
            <div className="h-[600px]">
              <RealtimeChat
                roomName={`room-${roomId}`}
                username={
                  user?.name || user?.username || user?.email || "Anonyme"
                }
                userId={user?.id}
                roomId={roomId}
                token={token || ""}
              />
            </div>
          </Card>
        </div>

        <aside className="lg:col-span-1 space-y-6">
          <Card>
            <CardHeader>
              <CardDescription className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                Membres du groupe
              </CardDescription>
              <CardTitle className="text-3xl">{members.length}</CardTitle>
            </CardHeader>
            <CardContent>
              {members.length > 0 ? (
                <div className="space-y-2">
                  {members.map((member, index) => {
                    // Get user ID from member data
                    const userId = member.user_id || member.id;

                    // Look up user info from users map
                    const userInfo = users.get(userId);

                    // Extract display name with priority:
                    // 1. From users map (fetched from /users API)
                    // 2. From member.user object
                    // 3. From member object directly
                    // 4. Fallback to user ID
                    const displayName =
                      userInfo?.name ||
                      userInfo?.username ||
                      userInfo?.email ||
                      member.user?.name ||
                      member.user?.username ||
                      member.user?.email ||
                      member.name ||
                      member.username ||
                      member.email ||
                      `Membre ${userId}`;

                    // Use a combination of id and user_id for unique key
                    const uniqueKey = `${member.id}-${userId}-${index}`;

                    return (
                      <div
                        key={uniqueKey}
                        className="flex items-center gap-2 p-2 rounded-md bg-muted/50"
                      >
                        <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                          <Users className="h-4 w-4 text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">
                            {displayName}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  Aucun membre pour le moment
                </p>
              )}
            </CardContent>
          </Card>
          {event && (
            <Card>
              <CardHeader>
                <CardTitle>Événement associé</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <div>
                      <p className="font-medium">{event.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {event.description}
                      </p>
                    </div>
                  </div>
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
                  <Button asChild variant="outline" size="sm" className="mt-4">
                    <Link href={`/events/${event.id}`}>
                      Voir l'événement complet
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </aside>
      </div>
    </main>
  );
}
