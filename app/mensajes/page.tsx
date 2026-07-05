'use client'

import { Suspense, useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { ArrowLeft, MessageCircle, Send } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { createClient } from '@/lib/supabase/client'

type ConversationRow = {
  id: string
  lost_pet_id: number
  owner_id: string
  participant_id: string
  created_at: string
  updated_at: string
}

type MessageRow = {
  id: number
  conversation_id: string
  sender_id: string
  body: string
  read_at: string | null
  created_at: string
}

type ProfileRow = {
  id: string
  full_name: string | null
  email: string | null
}

type LostPetRow = {
  id: number
  name: string
  image_url: string | null
  status: string
}

type ConversationView = ConversationRow & {
  pet?: LostPetRow
  otherProfile?: ProfileRow
  lastMessage?: MessageRow
}

function formatTime(value: string) {
  return new Intl.DateTimeFormat('es-SV', {
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(value))
}

function displayName(profile?: ProfileRow) {
  return profile?.full_name || profile?.email?.split('@')[0] || 'Usuario'
}

function MessagesContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const selectedId = searchParams.get('conversation')
  const [userId, setUserId] = useState<string | null>(null)
  const [conversations, setConversations] = useState<ConversationView[]>([])
  const [messages, setMessages] = useState<MessageRow[]>([])
  const [draft, setDraft] = useState('')
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const selectedConversation = useMemo(
    () => conversations.find((conversation) => conversation.id === selectedId) ?? conversations[0],
    [conversations, selectedId],
  )

  useEffect(() => {
    async function loadConversations() {
      const supabase = createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        router.replace('/auth/login?redirect=/mensajes')
        return
      }

      setUserId(user.id)

      const { data: conversationData, error: conversationError } = await supabase
        .from('conversations')
        .select('*')
        .order('updated_at', { ascending: false })

      if (conversationError) {
        setError(conversationError.message)
        setLoading(false)
        return
      }

      const rows = (conversationData ?? []) as ConversationRow[]
      const petIds = [...new Set(rows.map((conversation) => conversation.lost_pet_id))]
      const profileIds = [
        ...new Set(rows.flatMap((conversation) => [conversation.owner_id, conversation.participant_id])),
      ]
      const conversationIds = rows.map((conversation) => conversation.id)

      const [{ data: pets }, { data: profiles }, { data: lastMessages }] = await Promise.all([
        petIds.length
          ? supabase.from('lost_pets').select('id, name, image_url, status').in('id', petIds)
          : Promise.resolve({ data: [] }),
        profileIds.length
          ? supabase.from('profiles').select('id, full_name, email').in('id', profileIds)
          : Promise.resolve({ data: [] }),
        conversationIds.length
          ? supabase
              .from('messages')
              .select('*')
              .in('conversation_id', conversationIds)
              .order('created_at', { ascending: false })
              .limit(100)
          : Promise.resolve({ data: [] }),
      ])

      const petsById = new Map((pets ?? []).map((pet) => [pet.id, pet as LostPetRow]))
      const profilesById = new Map((profiles ?? []).map((profile) => [profile.id, profile as ProfileRow]))
      const lastMessageByConversation = new Map<string, MessageRow>()

      for (const message of (lastMessages ?? []) as MessageRow[]) {
        if (!lastMessageByConversation.has(message.conversation_id)) {
          lastMessageByConversation.set(message.conversation_id, message)
        }
      }

      const hydrated = rows.map((conversation) => {
        const otherId = conversation.owner_id === user.id ? conversation.participant_id : conversation.owner_id
        return {
          ...conversation,
          pet: petsById.get(conversation.lost_pet_id),
          otherProfile: profilesById.get(otherId),
          lastMessage: lastMessageByConversation.get(conversation.id),
        }
      })

      setConversations(hydrated)
      setLoading(false)

      if (!selectedId && hydrated[0]) {
        router.replace(`/mensajes?conversation=${hydrated[0].id}`)
      }
    }

    loadConversations()
  }, [router, selectedId])

  useEffect(() => {
    if (!selectedConversation?.id) {
      setMessages([])
      return
    }

    let mounted = true
    const supabase = createClient()

    async function loadMessages() {
      const { data, error: messagesError } = await supabase
        .from('messages')
        .select('*')
        .eq('conversation_id', selectedConversation!.id)
        .order('created_at', { ascending: true })

      if (!mounted) return
      if (messagesError) {
        setError(messagesError.message)
        return
      }
      setMessages((data ?? []) as MessageRow[])
    }

    loadMessages()

    const channel = supabase
      .channel(`messages:${selectedConversation.id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${selectedConversation.id}`,
        },
        (payload) => {
          const incoming = payload.new as MessageRow
          setMessages((current) =>
            current.some((message) => message.id === incoming.id)
              ? current
              : [...current, incoming],
          )
        },
      )
      .subscribe()

    return () => {
      mounted = false
      supabase.removeChannel(channel)
    }
  }, [selectedConversation?.id])

  async function sendMessage(e: React.FormEvent) {
    e.preventDefault()
    if (!selectedConversation || !userId || !draft.trim()) return

    setSending(true)
    setError(null)

    const body = draft.trim()
    setDraft('')

    const supabase = createClient()
    const { error: insertError } = await supabase.from('messages').insert({
      conversation_id: selectedConversation.id,
      sender_id: userId,
      body,
    })

    if (insertError) {
      setDraft(body)
      setError(insertError.message)
      setSending(false)
      return
    }

    await supabase
      .from('conversations')
      .update({ updated_at: new Date().toISOString() })
      .eq('id', selectedConversation.id)

    setSending(false)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-foreground/60">Cargando mensajes...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="grid min-h-screen grid-cols-1 lg:grid-cols-[360px_1fr]">
        <aside className="border-b border-border bg-card/70 lg:h-screen lg:border-b-0 lg:border-r">
          <div className="flex h-16 items-center gap-3 border-b border-border px-4">
            <Link href="/">
              <Button variant="ghost" size="icon-sm" aria-label="Volver">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            <div>
              <h1 className="font-semibold">Mensajes</h1>
              <p className="text-xs text-foreground/50">Chats sobre publicaciones</p>
            </div>
          </div>

          <div className="max-h-[42vh] overflow-y-auto p-3 lg:max-h-[calc(100vh-4rem)]">
            {conversations.length === 0 ? (
              <div className="rounded-lg border border-border p-6 text-center">
                <MessageCircle className="mx-auto mb-3 h-8 w-8 text-foreground/40" />
                <p className="text-sm text-foreground/60">
                  Aun no tienes conversaciones.
                </p>
              </div>
            ) : (
              conversations.map((conversation) => {
                const active = conversation.id === selectedConversation?.id
                return (
                  <button
                    key={conversation.id}
                    type="button"
                    onClick={() => router.replace(`/mensajes?conversation=${conversation.id}`)}
                    className={`mb-2 flex w-full items-center gap-3 rounded-lg p-3 text-left transition ${
                      active ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'
                    }`}
                  >
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-muted">
                      {conversation.pet?.image_url ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={conversation.pet.image_url}
                          alt={conversation.pet.name}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <MessageCircle className="h-5 w-5 text-foreground/50" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="truncate font-medium">{conversation.pet?.name ?? 'Publicacion'}</p>
                      <p className={`truncate text-sm ${active ? 'text-primary-foreground/70' : 'text-foreground/55'}`}>
                        {displayName(conversation.otherProfile)}
                      </p>
                      {conversation.lastMessage && (
                        <p className={`truncate text-xs ${active ? 'text-primary-foreground/60' : 'text-foreground/45'}`}>
                          {conversation.lastMessage.body}
                        </p>
                      )}
                    </div>
                  </button>
                )
              })
            )}
          </div>
        </aside>

        <main className="flex min-h-[calc(100vh-16rem)] flex-col lg:h-screen">
          {selectedConversation ? (
            <>
              <header className="border-b border-border px-5 py-4">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-sm text-foreground/55">
                      Conversacion con {displayName(selectedConversation.otherProfile)}
                    </p>
                    <h2 className="text-xl font-semibold">
                      {selectedConversation.pet?.name ?? 'Publicacion'}
                    </h2>
                  </div>
                  <Link href={`/mascotas/perdidas/${selectedConversation.lost_pet_id}`}>
                    <Button variant="outline">Ver publicacion</Button>
                  </Link>
                </div>
              </header>

              {error && (
                <p className="mx-5 mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-700 dark:bg-red-900/20 dark:text-red-400">
                  {error}
                </p>
              )}

              <div className="flex-1 space-y-3 overflow-y-auto px-5 py-6">
                {messages.length === 0 ? (
                  <div className="flex h-full items-center justify-center text-sm text-foreground/55">
                    Escribe el primer mensaje sobre esta publicacion.
                  </div>
                ) : (
                  messages.map((message) => {
                    const mine = message.sender_id === userId
                    return (
                      <div key={message.id} className={`flex ${mine ? 'justify-end' : 'justify-start'}`}>
                        <div
                          className={`max-w-[80%] rounded-2xl px-4 py-2 text-sm ${
                            mine
                              ? 'bg-primary text-primary-foreground'
                              : 'bg-muted text-foreground'
                          }`}
                        >
                          <p className="whitespace-pre-wrap break-words">{message.body}</p>
                          <p className={`mt-1 text-[11px] ${mine ? 'text-primary-foreground/70' : 'text-foreground/45'}`}>
                            {formatTime(message.created_at)}
                          </p>
                        </div>
                      </div>
                    )
                  })
                )}
              </div>

              <form onSubmit={sendMessage} className="border-t border-border p-4">
                <div className="flex gap-3">
                  <input
                    value={draft}
                    onChange={(event) => setDraft(event.target.value)}
                    maxLength={1000}
                    placeholder="Escribe un mensaje..."
                    className="h-10 flex-1 rounded-lg border border-border bg-background px-4 text-foreground outline-none focus:ring-2 focus:ring-primary"
                  />
                  <Button type="submit" disabled={sending || !draft.trim()} className="bg-primary hover:bg-primary/90">
                    <Send className="h-4 w-4" />
                    Enviar
                  </Button>
                </div>
              </form>
            </>
          ) : (
            <div className="flex flex-1 items-center justify-center p-8 text-center text-foreground/60">
              Selecciona una conversacion para empezar.
            </div>
          )}
        </main>
      </div>
    </div>
  )
}

export default function MessagesPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-background flex items-center justify-center">
          <p className="text-foreground/60">Cargando mensajes...</p>
        </div>
      }
    >
      <MessagesContent />
    </Suspense>
  )
}
