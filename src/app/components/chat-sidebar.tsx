'use client'

import { useState, useEffect, useRef, type KeyboardEvent } from 'react'
import { MessageSquare, X, Send, Minus, ImageIcon } from 'lucide-react'
import { Button } from '~/components/ui/button'
import { ScrollArea } from '~/components/ui/scroll-area'
import { Avatar, AvatarFallback } from '~/components/ui/avatar'
import { cn } from '~/lib/utils'
import { useBoundStore } from '~/zustand/store'
import { useChat } from '~/hooks/useChat'
import { ConversationItem } from '~/app/components/chat-widget/ConversationItem'
import { MessageItem, ReplyBar } from '~/app/components/chat-widget/MessageItem'
import type { ChatConversation, ChatMessage } from '~/apiRequests/chat.apiRequest'
import {
  getConversationsAPI,
  getMessagesAPI,
  sendTextMessageAPI,
  sendImageMessageAPI,
  markAsReadAPI,
  deleteMessageAPI,
} from '~/apiRequests/chat.apiRequest'
import { SENDER_TYPE } from '~/constants/chat.constant'


export function ChatSidebar() {
  const shop = useBoundStore((state) => state.shop)
  const [isOpen, setIsOpen] = useState(false)
  const [conversations, setConversations] = useState<ChatConversation[]>([])
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [messageText, setMessageText] = useState('')
  const [replyTo, setReplyTo] = useState<ChatMessage | null>(null)
  const [sending, setSending] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const { onNewMessage, onConversationUpdated, onMessageDeleted, onMessagesRead } = useChat({
    shopId: shop?.id,
  })

  // Load conversations
  useEffect(() => {
    if (shop?.id && isOpen) {
      loadConversations()
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shop?.id, isOpen])

  // Load messages when active conversation changes
  useEffect(() => {
    if (activeConversationId && shop) {
      loadMessages(activeConversationId)
      markAsReadAPI(activeConversationId, shop.id, SENDER_TYPE.SHOP).catch(() => {})
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeConversationId])

  // Socket.IO listeners
  useEffect(() => {
    onNewMessage((newMsg) => {
      if (newMsg.conversationId === activeConversationId) {
        setMessages(prev => [...prev, newMsg])
        if (shop && newMsg.senderType !== SENDER_TYPE.SHOP) {
          markAsReadAPI(newMsg.conversationId, shop.id, SENDER_TYPE.SHOP).catch(() => {})
        }
      }
    })

    onConversationUpdated((updatedConv) => {
      setConversations(prev => {
        const exists = prev.find(c => c.id === updatedConv.id)
        if (exists) {
          return prev
            .map(c => c.id === updatedConv.id ? { ...c, ...updatedConv } : c)
            .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
        }
        loadConversations()
        return prev
      })
    })

    onMessageDeleted((data) => {
      if (data.conversationId === activeConversationId) {
        setMessages(prev =>
          prev.map(m => m.id === data.messageId ? { ...m, isDeleted: true, message: null } : m)
        )
      }
    })

    onMessagesRead((data) => {
      setConversations(prev =>
        prev.map(c => c.id === data.conversationId
          ? {
            ...c,
            unreadCountUser: data.readByType === 'USER' ? 0 : c.unreadCountUser,
            unreadCountShop: data.readByType === 'SHOP' ? 0 : c.unreadCountShop,
          }
          : c
        )
      )
    })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeConversationId])

  useEffect(() => {
    // Luôn cuộn xuống mỗi khi danh sách tin nhắn thay đổi
    requestAnimationFrame(() => {
      const viewport = messagesEndRef.current?.closest('[data-radix-scroll-area-viewport]') as HTMLElement | null
      if (viewport) {
        viewport.scrollTo({ top: viewport.scrollHeight, behavior: 'smooth' })
      } else {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' })
      }
    })
  }, [messages])

  const loadConversations = async () => {
    if (!shop) return
    try {
      const res = await getConversationsAPI({ type: 'shop', shopId: shop.id })
      if (res && 'data' in res) {
        setConversations(((res as unknown) as { data: ChatConversation[] }).data || [])
      }
    } catch { /* ignore */ }
  }

  const loadMessages = async (conversationId: string) => {
    try {
      const res = await getMessagesAPI(conversationId)
      if (res && 'data' in res) {
        setMessages(((res as unknown) as { data: ChatMessage[] }).data || [])
      }
    } catch { /* ignore */ }
  }

  const handleSendText = async () => {
    if (!messageText.trim() || sending || !shop) return
    const conv = conversations.find(c => c.id === activeConversationId)
    if (!conv) return

    try {
      setSending(true)
      await sendTextMessageAPI({
        shopId: shop.id,
        senderId: shop.id,
        senderType: SENDER_TYPE.SHOP,
        message: messageText.trim(),
        replyToMessageId: replyTo?.id || null,
        userId: conv.userId,
      })
      setMessageText('')
      setReplyTo(null)
    } catch { /* ignore */ } finally {
      setSending(false)
    }
  }

  const handleSendImage = async (file: File) => {
    if (!shop) return
    const conv = conversations.find(c => c.id === activeConversationId)
    if (!conv) return

    try {
      setSending(true)
      await sendImageMessageAPI({
        shopId: shop.id,
        senderId: shop.id,
        senderType: SENDER_TYPE.SHOP,
        file,
        replyToMessageId: replyTo?.id || null,
        userId: conv.userId,
      })
      setReplyTo(null)
    } catch { /* ignore */ } finally {
      setSending(false)
    }
  }

  const handleDeleteMessage = async (messageId: string) => {
    if (!shop) return
    try {
      await deleteMessageAPI(messageId, shop.id, SENDER_TYPE.SHOP)
    } catch { /* ignore */ }
  }

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendText()
    }
  }

  const activeConv = conversations.find(c => c.id === activeConversationId)

  return (
    <>
      {/* Floating chat windows khi click conversation */}
      {activeConv && (
        <div className='fixed bottom-0 right-16 z-60 flex items-end gap-3 pointer-events-none'>
          <div className='w-80 pointer-events-auto bg-background border rounded-t-lg shadow-xl overflow-hidden flex flex-col h-[450px]'>
            {/* Header */}
            <div className='bg-[#004643] text-white p-3 flex items-center justify-between shrink-0'>
              <div className='flex items-center gap-2'>
                <Avatar className='size-6 border border-white/20'>
                  <AvatarFallback className='bg-white/20 text-white text-xs'>
                    {(activeConv.userName || 'U')[0]}
                  </AvatarFallback>
                </Avatar>
                <span className='text-sm font-medium truncate max-w-[140px]'>
                  {activeConv.userName || `User ${activeConv.userId.slice(0, 6)}`}
                </span>
              </div>
              <div className='flex items-center gap-1'>
                <Button
                  variant='ghost'
                  size='icon'
                  className='size-7 hover:bg-white/10 text-white'
                  onClick={() => setActiveConversationId(null)}
                >
                  <Minus className='size-4' />
                </Button>
                <Button
                  variant='ghost'
                  size='icon'
                  className='size-7 hover:bg-white/10 text-white'
                  onClick={() => setActiveConversationId(null)}
                >
                  <X className='size-4' />
                </Button>
              </div>
            </div>

            {/* Messages */}
            <ScrollArea className='flex-1 min-h-0 p-3 bg-slate-50'>
              {messages.length === 0 ? (
                <div className='flex items-center justify-center h-full text-xs text-gray-400'>
                  Chưa có tin nhắn
                </div>
              ) : (
                <div className='space-y-1'>
                  {messages.map((msg) => (
                    <MessageItem
                      key={msg.id}
                      message={msg}
                      isOwnMessage={msg.senderType === SENDER_TYPE.SHOP}
                      onReply={(m) => setReplyTo(m)}
                      onDelete={handleDeleteMessage}
                    />
                  ))}
                  <div ref={messagesEndRef} />
                </div>
              )}
            </ScrollArea>

            {/* Reply bar */}
            {replyTo && <ReplyBar replyTo={replyTo} onCancel={() => setReplyTo(null)} />}

            {/* Input */}
            <div className='p-2 border-t bg-background shrink-0'>
              <div className='flex items-center gap-2'>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className='p-1.5 text-gray-400 hover:text-[#004643] rounded'
                >
                  <ImageIcon className='w-4 h-4' />
                </button>
                <input
                  ref={fileInputRef}
                  type='file'
                  accept='image/*'
                  className='hidden'
                  onChange={(e) => {
                    const file = e.target.files?.[0]
                    if (file) handleSendImage(file)
                    e.target.value = ''
                  }}
                />
                <input
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  onKeyDown={handleKeyDown}
                  className='flex-1 bg-muted px-3 py-1.5 rounded-full text-xs outline-none focus:ring-1 focus:ring-[#004643]'
                  placeholder='Nhập tin nhắn...'
                />
                <Button
                  size='icon'
                  className='size-8 rounded-full bg-[#004643] hover:bg-[#004643]/90'
                  onClick={handleSendText}
                  disabled={!messageText.trim() || sending}
                >
                  <Send className='size-3 text-white' />
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Sidebar */}
      <div className='fixed top-0 right-0 z-50 flex h-screen'>
        {/* Icon column */}
        <div className='flex w-12 flex-col items-center border-l bg-background py-4 shadow-sm'>
          <Button
            variant='ghost'
            size='icon'
            onClick={() => setIsOpen(!isOpen)}
            className={cn(
              'transition-colors',
              isOpen ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:text-primary',
            )}
          >
            <MessageSquare className='size-5' />
          </Button>
        </div>

        {/* Conversation list */}
        <div
          className={cn(
            'flex flex-col border-l bg-background transition-all duration-300 ease-in-out',
            isOpen ? 'w-80' : 'w-0 overflow-hidden border-none',
          )}
        >
          <div className='flex h-16 items-center justify-between border-b px-4 shrink-0'>
            <h2 className='text-lg font-bold text-[#004643]'>Tin nhắn</h2>
            <Button variant='ghost' size='icon' onClick={() => setIsOpen(false)} className='size-8'>
              <X className='size-4' />
            </Button>
          </div>

          <ScrollArea className='flex-1'>
            <div className='p-2'>
              {conversations.length === 0 ? (
                <div className='p-4 text-center text-xs text-gray-400'>
                  {isOpen ? 'Chưa có cuộc trò chuyện nào' : ''}
                </div>
              ) : (
                conversations.map((conv) => (
                  <ConversationItem
                    key={conv.id}
                    conversation={conv}
                    isActive={conv.id === activeConversationId}
                    onClick={() => setActiveConversationId(conv.id)}
                    viewerType={SENDER_TYPE.SHOP}
                  />
                ))
              )}
            </div>
          </ScrollArea>
        </div>
      </div>
    </>
  )
}
