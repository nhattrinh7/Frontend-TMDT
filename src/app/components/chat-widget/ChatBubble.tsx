'use client'

import { MessageCircle } from 'lucide-react'
import { cn } from '~/lib/utils'

interface ChatBubbleProps {
  totalUnread: number
  isOpen: boolean
  onClick: () => void
}

export function ChatBubble({ totalUnread, isOpen, onClick }: ChatBubbleProps) {
  if (isOpen) return null

  return (
    <button
      onClick={onClick}
      className={cn(
        'fixed bottom-6 right-6 z-100',
        'flex items-center justify-center',
        'w-14 h-14 rounded-full',
        'bg-[#004643] hover:bg-[#005d58]',
        'text-white shadow-lg hover:shadow-xl',
        'transition-all duration-300 ease-in-out',
        'hover:scale-110 active:scale-95',
      )}
    >
      <MessageCircle className='w-6 h-6' />
      {totalUnread > 0 && (
        <span className='absolute -top-1 -right-1 flex items-center justify-center min-w-[22px] h-[22px] px-1.5 rounded-full bg-red-500 text-white text-xs font-bold shadow-md'>
          {totalUnread > 99 ? '99+' : totalUnread}
        </span>
      )}
    </button>
  )
}
