'use client'

import * as React from 'react'
import { MessageSquare, X, Send, Minus } from 'lucide-react'
import { Button } from '~/components/ui/button'
import { ScrollArea } from '~/components/ui/scroll-area'
import { Avatar, AvatarFallback, AvatarImage } from '~/components/ui/avatar'
import { cn } from '~/lib/utils'

interface Conversation {
  id: string
  name: string
  avatar: string
  lastMessage: string
  time: string
  unread?: boolean
}

const MOCK_CONVERSATIONS: Conversation[] = [
  {
    id: '1',
    name: 'Nguyễn Văn A',
    avatar: '/diverse-group-avatars.png',
    lastMessage: 'Đơn hàng của mình khi nào giao vậy shop?',
    time: '10:30',
    unread: true,
  },
  {
    id: '2',
    name: 'Trần Thị B',
    avatar: '/diverse-group-avatars.png',
    lastMessage: 'Cảm ơn shop, hàng rất đẹp ạ!',
    time: 'Hôm qua',
  },
  {
    id: '3',
    name: 'Lê Văn C',
    avatar: '/diverse-group-avatars.png',
    lastMessage: 'Shop có mã giảm giá cho khách quen không?',
    time: '2 ngày trước',
  },
]

export function ChatSidebar() {
  const [isOpen, setIsOpen] = React.useState(false)
  const [activeChats, setActiveChats] = React.useState<Conversation[]>([])

  const openChat = (conv: Conversation) => {
    if (!activeChats.find((c) => c.id === conv.id)) {
      setActiveChats((prev) => [...prev, conv].slice(-3)) // Tối đa 3 cửa sổ chat
    }
  }

  const closeChat = (id: string) => {
    setActiveChats((prev) => prev.filter((c) => c.id !== id))
  }

  return (
    <>
      {/* Cửa sổ chat nổi (Floating Chat Windows) */}
      <div className='fixed bottom-0 right-16 z-[60] flex items-end gap-3 pointer-events-none'>
        {activeChats.map((chat) => (
          <div
            key={chat.id}
            className='w-72 pointer-events-auto bg-background border rounded-t-lg shadow-xl overflow-hidden flex flex-col h-[400px]'
          >
            <div className='bg-[#004643] text-white p-3 flex items-center justify-between'>
              <div className='flex items-center gap-2'>
                <Avatar className='size-6 border border-white/20'>
                  <AvatarImage src={chat.avatar || '/placeholder.svg'} />
                  <AvatarFallback>{chat.name[0]}</AvatarFallback>
                </Avatar>
                <span className='text-sm font-medium truncate max-w-[140px]'>{chat.name}</span>
              </div>
              <div className='flex items-center gap-1'>
                <Button
                  variant='ghost'
                  size='icon'
                  className='size-7 hover:bg-white/10 text-white'
                  onClick={() => closeChat(chat.id)}
                >
                  <Minus className='size-4' />
                </Button>
                <Button
                  variant='ghost'
                  size='icon'
                  className='size-7 hover:bg-white/10 text-white'
                  onClick={() => closeChat(chat.id)}
                >
                  <X className='size-4' />
                </Button>
              </div>
            </div>
            <ScrollArea className='flex-1 p-3 bg-slate-50'>
              <div className='space-y-3 text-sm'>
                <div className='bg-white p-2 rounded-lg border shadow-sm max-w-[85%]'>{chat.lastMessage}</div>
                <div className='bg-[#004643] text-white p-2 rounded-lg ml-auto max-w-[85%]'>
                  Chào bạn, chúng tôi sẽ kiểm tra và phản hồi sớm nhất!
                </div>
              </div>
            </ScrollArea>
            <div className='p-2 border-t bg-background'>
              <div className='flex gap-2'>
                <input
                  className='flex-1 bg-muted px-3 py-1.5 rounded-full text-xs outline-none focus:ring-1 focus:ring-[#004643]'
                  placeholder='Nhập tin nhắn...'
                />
                <Button size='icon' className='size-8 rounded-full bg-[#004643] hover:bg-[#004643]/90'>
                  <Send className='size-3 text-white' />
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className='fixed top-0 right-0 z-50 flex h-screen'>
        {/* Cột icon hẹp */}
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

        {/* Danh sách cuộc trò chuyện */}
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
              {MOCK_CONVERSATIONS.map((conv) => (
                <button
                  key={conv.id}
                  onClick={() => openChat(conv)}
                  className='w-full flex items-center gap-3 p-3 rounded-lg hover:bg-muted transition-colors text-left'
                >
                  <div className='relative'>
                    <Avatar className='size-10'>
                      <AvatarImage src={conv.avatar || '/placeholder.svg'} />
                      <AvatarFallback>{conv.name[0]}</AvatarFallback>
                    </Avatar>
                    <div className='absolute bottom-0 right-0 size-2.5 bg-green-500 border-2 border-white rounded-full' />
                  </div>
                  <div className='flex-1 overflow-hidden'>
                    <div className='flex justify-between items-baseline mb-0.5'>
                      <span className={cn('text-sm font-semibold truncate', conv.unread && 'text-[#004643]')}>
                        {conv.name}
                      </span>
                      <span className='text-[10px] text-muted-foreground shrink-0'>{conv.time}</span>
                    </div>
                    <p
                      className={cn(
                        'text-xs truncate text-muted-foreground',
                        conv.unread && 'font-medium text-foreground',
                      )}
                    >
                      {conv.lastMessage}
                    </p>
                  </div>
                  {conv.unread && <div className='size-2 bg-[#004643] rounded-full shrink-0' />}
                </button>
              ))}
            </div>
          </ScrollArea>
        </div>
      </div>
    </>
  )
}
