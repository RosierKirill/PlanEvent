"use client";

import useSWR from "swr";

interface MembershipData {
  members?: Array<{ user_id?: string; id?: string }>;
  is_member?: boolean;
}

interface UseRoomMembershipResult {
  isMember: boolean | undefined;
  isLoading: boolean;
  error: Error | undefined;
  mutate: () => void;
}

async function fetchMembership(
  url: string,
  token: string,
  userId: string
): Promise<boolean> {
  const response = await fetch(url, {
    headers: { authorization: `Bearer ${token}` },
  });

  if (!response.ok) {
    return false;
  }

  const data: MembershipData = await response.json();

  // Check if backend returns is_member field directly
  if (typeof data?.is_member === "boolean") {
    return data.is_member;
  }

  // Otherwise, check if current user is in members array
  if (Array.isArray(data?.members)) {
    return data.members.some((m: any) => {
      const memberId = m.user_id || m.id;
      return memberId === userId;
    });
  }

  return false;
}

/**
 * Hook to check room membership with SWR caching
 * Prevents N+1 API call pattern by caching membership checks
 */
export function useRoomMembership(
  roomId: string | null,
  token: string | null,
  userId: string | null
): UseRoomMembershipResult {
  const shouldFetch = roomId && token && userId;

  const { data, error, mutate } = useSWR<boolean>(
    shouldFetch ? [`/api/room-members/check/${roomId}`, token, userId] : null,
    ([url, tkn, uid]: [string, string, string]) =>
      fetchMembership(url, tkn, uid),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      dedupingInterval: 60000, // Cache for 1 minute
      shouldRetryOnError: false,
    }
  );

  return {
    isMember: data,
    isLoading: shouldFetch ? data === undefined && !error : false,
    error,
    mutate,
  };
}
