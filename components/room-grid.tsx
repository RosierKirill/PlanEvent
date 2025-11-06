"use client";
import { RoomCard } from "@/components/room-card";
import { RoomCardSkeleton } from "@/components/room-card-skeleton";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { useRoomMembership } from "@/hooks/use-room-membership";
import { LogIn } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import * as React from "react";
import useSWR, { mutate as globalMutate } from "swr";

// Fetcher function for SWR
async function fetchRooms(url: string, token: string | null) {
  const headers: Record<string, string> = {};
  if (token) headers["authorization"] = `Bearer ${token}`;

  const res = await fetch(url, { headers });
  const ct = res.headers.get("content-type") || "";
  const text = await res.text();

  if (!res.ok) throw new Error(`Erreur ${res.status}: ${text}`);
  if (!ct.includes("application/json"))
    throw new Error("Réponse non JSON du serveur");

  try {
    const data = JSON.parse(text);
    // Normalize: Array | { rooms } | { data } | { items } | { results }
    let list: any[] = [];
    if (Array.isArray(data)) list = data;
    else if (data && typeof data === "object") {
      list = (data.rooms ||
        data.data ||
        data.items ||
        data.results ||
        []) as any[];
    }

    if (!Array.isArray(list)) {
      throw new Error("Format de réponse inattendu pour les groupes");
    }

    return list;
  } catch (e: any) {
    throw new Error(`Impossible de parser la réponse JSON: ${e.message}`);
  }
}

// Component to handle membership check with lazy loading
function RoomCardWithMembership({
  room,
  onJoin,
  onLeave,
  joiningId,
  filterByMembership,
  optimisticMembership,
}: {
  room: any;
  onJoin: (id: string) => void;
  onLeave: (id: string) => void;
  joiningId: string | null;
  filterByMembership?: boolean;
  optimisticMembership?: Record<string, boolean>;
}) {
  const { token, isAuthenticated, user } = useAuth();
  const { isMember: fetchedIsMember, isLoading } = useRoomMembership(
    room.id,
    isAuthenticated ? token : null,
    isAuthenticated && user?.id ? user.id : null
  );

  // Use optimistic update if available, otherwise use fetched value
  const hasOptimisticUpdate = optimisticMembership?.[room.id] !== undefined;
  const isMember = hasOptimisticUpdate
    ? optimisticMembership[room.id]
    : fetchedIsMember;

  // Don't show card while membership is loading (unless we have optimistic update)
  if (isLoading && !hasOptimisticUpdate) {
    return null;
  }

  // Filter based on membership if specified
  if (filterByMembership !== undefined && isMember !== undefined) {
    // filterByMembership=true means show only members
    // filterByMembership=false means show only non-members
    if (filterByMembership && !isMember) return null;
    if (!filterByMembership && isMember) return null;
  }

  // Show room with loaded membership status
  const roomWithMembership = {
    ...room,
    isMember,
  };

  return (
    <RoomCard
      room={roomWithMembership}
      onJoin={onJoin}
      onLeave={onLeave}
      joiningId={joiningId}
    />
  );
}

// Section component that renders filtered rooms
function RoomSection({
  title,
  rooms,
  filterByMembership,
  onJoin,
  onLeave,
  joiningId,
  optimisticMembership,
}: {
  title: string;
  rooms: any[];
  filterByMembership: boolean;
  onJoin: (id: string) => void;
  onLeave: (id: string) => void;
  joiningId: string | null;
  optimisticMembership?: Record<string, boolean>;
}) {
  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">{title}</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {rooms.map((room: any) => (
          <RoomCardWithMembership
            key={room.id}
            room={room}
            onJoin={onJoin}
            onLeave={onLeave}
            joiningId={joiningId}
            filterByMembership={filterByMembership}
            optimisticMembership={optimisticMembership}
          />
        ))}
      </div>
    </div>
  );
}

export function RoomGrid() {
  const searchParams = useSearchParams();
  const q = searchParams?.get("q");
  const { token, isAuthenticated, user } = useAuth();
  const [authPrompt, setAuthPrompt] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);

  // Use SWR to fetch rooms with caching
  const {
    data: rooms = [],
    error,
    isLoading,
    mutate,
  } = useSWR(["/api/rooms", token], ([url, tkn]) => fetchRooms(url, tkn), {
    revalidateOnFocus: false,
    dedupingInterval: 30000, // Cache for 30 seconds
  });

  // Client-side search filter
  const filteredRooms = React.useMemo(() => {
    if (!q || !q.trim()) return rooms;

    const searchTerm = q.trim().toLowerCase();
    return rooms.filter((room: any) => {
      const name = (room.name || "").toLowerCase();
      const description = (room.description || "").toLowerCase();
      return name.includes(searchTerm) || description.includes(searchTerm);
    });
  }, [rooms, q]);

  const [joiningId, setJoiningId] = React.useState<string | null>(null);
  const [membershipUpdates, setMembershipUpdates] = React.useState<
    Record<string, boolean>
  >({});
  const [refreshKey, setRefreshKey] = React.useState(0);

  const onJoin = async (roomId: string) => {
    if (!isAuthenticated || !token || !user?.id) {
      setAuthPrompt(true);
      setErrorMessage(null);
      return;
    }
    setJoiningId(roomId);

    setMembershipUpdates((prev) => {
      const next = { ...prev, [roomId]: true };
      return next;
    });
    setRefreshKey((prev) => prev + 1); // Force re-render

    try {
      const res = await fetch("/api/room-members", {
        method: "POST",
        headers: {
          "content-type": "application/json",
          authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ room_id: roomId, user_id: user.id }),
      });
      if (!res.ok) throw new Error(await res.text());

      // Invalidate both rooms list and membership cache for this specific room
      await Promise.all([
        mutate(),
        globalMutate(
          [`/api/room-members/check/${roomId}`, token, user.id],
          true,
          { revalidate: true }
        ),
      ]);
    } catch (e: any) {
      setErrorMessage(e?.message || "Erreur lors de la jonction au groupe");
      // Revert optimistic update on error
      setMembershipUpdates((prev) => {
        const next = { ...prev };
        delete next[roomId];
        return next;
      });
    } finally {
      setJoiningId(null);
    }
  };

  const onLeave = async (roomId: string) => {
    if (!isAuthenticated || !token || !user?.id) {
      setErrorMessage("Vous devez être connecté pour quitter un groupe");
      return;
    }
    setJoiningId(roomId);

    // Optimistic update BEFORE API call: mark as non-member locally immediately
    setMembershipUpdates((prev) => ({ ...prev, [roomId]: false }));
    setRefreshKey((prev) => prev + 1); // Force re-render

    try {
      const res = await fetch(`/api/room-members/leave/${roomId}`, {
        method: "DELETE",
        headers: { authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error(await res.text());

      // Invalidate both rooms list and membership cache for this specific room
      await Promise.all([
        mutate(),
        globalMutate(
          [`/api/room-members/check/${roomId}`, token, user.id],
          false,
          { revalidate: true }
        ),
      ]);
    } catch (e: any) {
      setErrorMessage(e?.message || "Erreur lors de la sortie du groupe");
      // Revert optimistic update on error
      setMembershipUpdates((prev) => {
        const next = { ...prev };
        delete next[roomId];
        return next;
      });
    } finally {
      setJoiningId(null);
    }
  };

  // Show skeleton while loading
  if (isLoading) {
    return (
      <div className="space-y-8">
        {isAuthenticated ? (
          <>
            {/* Mes Groupes skeleton */}
            <div>
              <div className="h-8 w-40 bg-muted animate-pulse rounded-md mb-4" />
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {Array.from({ length: 3 }).map((_, i) => (
                  <RoomCardSkeleton key={`my-${i}`} />
                ))}
              </div>
            </div>

            {/* Autres Groupes skeleton */}
            <div>
              <div className="h-8 w-44 bg-muted animate-pulse rounded-md mb-4" />
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {Array.from({ length: 3 }).map((_, i) => (
                  <RoomCardSkeleton key={`other-${i}`} />
                ))}
              </div>
            </div>
          </>
        ) : (
          /* Non-authenticated skeleton */
          <div>
            <div className="h-8 w-52 bg-muted animate-pulse rounded-md mb-4" />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <RoomCardSkeleton key={i} />
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  if (error)
    return <div className="text-red-500">Erreur : {error.message}</div>;
  if (filteredRooms.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        {q ? (
          <>
            Aucun groupe trouvé pour "{q}".
            <br />
            <span className="text-sm">
              Essayez avec d'autres mots-clés ou{" "}
              <Link href="/rooms" className="text-primary hover:underline">
                voir tous les groupes
              </Link>
              .
            </span>
          </>
        ) : (
          "Aucun groupe disponible."
        )}
      </div>
    );
  }

  return (
    <>
      {authPrompt && (
        <div className="mb-4 p-4 border rounded-md bg-muted/50 flex items-center justify-between">
          <span className="text-sm text-muted-foreground">
            Vous devez être connecté pour rejoindre un groupe
          </span>
          <Button asChild size="sm">
            <Link href="/login">
              <LogIn className="mr-2 h-4 w-4" /> Se connecter
            </Link>
          </Button>
        </div>
      )}
      {errorMessage && (
        <div className="mb-4 p-4 border border-destructive rounded-md bg-destructive/10 text-destructive text-sm">
          {errorMessage}
        </div>
      )}
      <div className="space-y-8">
        {isAuthenticated ? (
          <>
            {/* Mes Groupes - Only show rooms where user is a member */}
            <RoomSection
              key={`my-${refreshKey}`}
              title="Mes Groupes"
              rooms={filteredRooms}
              filterByMembership={true}
              onJoin={onJoin}
              onLeave={onLeave}
              joiningId={joiningId}
              optimisticMembership={membershipUpdates}
            />

            {/* Autres Groupes - Only show rooms where user is NOT a member */}
            <RoomSection
              key={`other-${refreshKey}`}
              title="Autres Groupes"
              rooms={filteredRooms}
              filterByMembership={false}
              onJoin={onJoin}
              onLeave={onLeave}
              joiningId={joiningId}
              optimisticMembership={membershipUpdates}
            />
          </>
        ) : (
          /* Non-authenticated users see all rooms */
          <div>
            <h2 className="text-2xl font-bold mb-4">Groupes disponibles</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredRooms.map((room: any) => (
                <RoomCard
                  key={room.id}
                  room={room}
                  onJoin={onJoin}
                  onLeave={onLeave}
                  joiningId={joiningId}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </>
  );
}
