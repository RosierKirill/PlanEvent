'use client'

import { createClient } from '@/lib/client'
import { useCallback, useEffect, useState } from 'react'

interface UseRealtimeChatProps {
  roomName: string
  username: string
  userId?: string
  roomId?: string
  token?: string
}

export interface ChatMessage {
  id: string
  content: string
  user: {
    name: string
    id?: string
  }
  createdAt: string
}

const EVENT_MESSAGE_TYPE = 'message'

export function useRealtimeChat({ roomName, username, userId, roomId, token }: UseRealtimeChatProps) {
  const supabase = createClient()
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [channel, setChannel] = useState<ReturnType<typeof supabase.channel> | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const [isLoadingHistory, setIsLoadingHistory] = useState(true)

  // Load message history from backend
  useEffect(() => {
    if (!roomId || !token) {
      setIsLoadingHistory(false)
      return
    }

    const loadHistory = async () => {
      try {
        const response = await fetch(`/api/messages/room/${roomId}?limit=100`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        if (response.ok) {
          const data = await response.json()
          // Backend returns {messages: [...], pagination: {...}}
          const messagesList = data.messages || []

          // If we have messages with user_id but no user info, fetch users
          const userIds = new Set<string>()
          messagesList.forEach((msg: any) => {
            if (msg.user_id && !msg.user) {
              userIds.add(msg.user_id)
            }
          })

          // Fetch user info if needed
          const usersMap = new Map<string, any>()
          if (userIds.size > 0 && token) {
            try {
              const usersResponse = await fetch(`/api/users?limit=1000`, {
                headers: {
                  Authorization: `Bearer ${token}`,
                },
              })
              if (usersResponse.ok) {
                const usersData = await usersResponse.json()
                const usersList = Array.isArray(usersData)
                  ? usersData
                  : usersData.items || usersData.users || usersData.data || []

                usersList.forEach((u: any) => {
                  usersMap.set(u.id, u)
                })
              }
            } catch (error) {
              console.error('Failed to fetch users:', error)
            }
          }

          // Transform backend format to our ChatMessage format
          const transformedMessages = messagesList.map((msg: any) => {
            // Get user info from either msg.user or usersMap
            const userInfo = msg.user || usersMap.get(msg.user_id)

            return {
              id: msg.id,
              content: msg.content,
              user: {
                name: userInfo?.name || userInfo?.username || userInfo?.email || 'Utilisateur',
                id: msg.user_id || userInfo?.id,
              },
              createdAt: msg.created_at,
            }
          })

          setMessages(transformedMessages)
        } else if (response.status === 404) {
          // Backend doesn't support message history yet, that's ok
          console.log('Message history not available on backend (404)')
        }
      } catch (error) {
        // Network error or backend not available, gracefully degrade
        console.log('Message history not available:', error)
      } finally {
        setIsLoadingHistory(false)
      }
    }

    loadHistory()
  }, [roomId, token])

  useEffect(() => {
    const newChannel = supabase.channel(roomName)

    newChannel
      .on('broadcast', { event: EVENT_MESSAGE_TYPE }, (payload) => {
        setMessages((current) => [...current, payload.payload as ChatMessage])
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          setIsConnected(true)
        } else {
          setIsConnected(false)
        }
      })

    setChannel(newChannel)

    return () => {
      supabase.removeChannel(newChannel)
    }
  }, [roomName, username, supabase])

  const sendMessage = useCallback(
    async (content: string) => {
      if (!channel || !isConnected) return

      const message: ChatMessage = {
        id: crypto.randomUUID(),
        content,
        user: {
          name: username,
          id: userId,
        },
        createdAt: new Date().toISOString(),
      }

      // Update local state immediately for the sender
      setMessages((current) => [...current, message])

      // Broadcast to other users via Supabase Realtime
      await channel.send({
        type: 'broadcast',
        event: EVENT_MESSAGE_TYPE,
        payload: message,
      })

      // Save to backend if roomId and token are provided
      if (roomId && token) {
        try {
          await fetch('/api/messages', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              room_id: roomId,
              content,
            }),
          })
        } catch (error) {
          console.error('Failed to save message:', error)
        }
      }
    },
    [channel, isConnected, username, userId, roomId, token]
  )

  return { messages, sendMessage, isConnected, isLoadingHistory }
}
