'use client'

import { cn } from '~/lib/utils'
import { Avatar, AvatarFallback, AvatarImage } from '~/components/ui/avatar'
import { formatDistanceToNow } from 'date-fns'
import { vi } from 'date-fns/locale'
import type { ChatConversation } from '~/apiRequests/chat.apiRequest'
import { SENDER_TYPE, MESSAGE_TYPE, type SenderType } from '~/constants/chat.constant'

interface ConversationItemProps {
  conversation: ChatConversation
  isActive: boolean
  onClick: () => void
  viewerType: SenderType
}

export function ConversationItem({ conversation, isActive, onClick, viewerType }: ConversationItemProps) {
  const displayName = viewerType === SENDER_TYPE.USER
    ? (conversation.shopName || 'Shop')
    : (conversation.userName || 'Người dùng')
  
  const displayAvatar = viewerType === SENDER_TYPE.USER ? conversation.shopLogo : conversation.userAvatar

  const unreadCount = viewerType === SENDER_TYPE.USER ? conversation.unreadCountUser : conversation.unreadCountShop
  const hasUnread = unreadCount > 0

  const timeAgo = conversation.lastMessageAt
    ? formatDistanceToNow(new Date(conversation.lastMessageAt), { addSuffix: false, locale: vi })
    : ''

  const lastMessagePreview = conversation.lastMessageType === MESSAGE_TYPE.IMAGE
    ? '📷 Hình ảnh'
    : conversation.lastMessageContent || 'Bắt đầu trò chuyện...'

  const getInitials = (name: string) => {
    return name.split(' ').map((w) => w[0]).join('').substring(0, 2).toUpperCase()
  }

  return (
    <button
      onClick={onClick}
      className={cn(
        'w-full flex items-center gap-3 p-3 rounded-lg transition-colors text-left',
        isActive ? 'bg-[#004643]/10 border-l-2 border-[#004643]' : 'hover:bg-gray-100',
      )}
    >
      <div className='relative shrink-0'>
        <Avatar className='size-10'>
          <AvatarImage src={displayAvatar || undefined} />
          <AvatarFallback className='bg-[#004643] text-white text-sm'>
            {getInitials(displayName)}
          </AvatarFallback>
        </Avatar>
      </div>

      <div className='flex-1 overflow-hidden min-w-0'>
        <div className='flex justify-between items-baseline mb-0.5'>
          <span className={cn('text-sm truncate', hasUnread ? 'font-bold text-gray-900' : 'font-medium text-gray-700')}>
            {displayName}
          </span>
          <span className='text-[10px] text-gray-400 shrink-0 ml-2'>{timeAgo}</span>
        </div>
        <div className='flex items-center gap-2'>
          <p className={cn(
            'text-xs truncate flex-1',
            hasUnread ? 'font-semibold text-gray-800' : 'text-gray-500',
          )}>
            {conversation.lastMessageSenderType === viewerType
              ? `Bạn: ${lastMessagePreview}`
              : lastMessagePreview}
          </p>
          {hasUnread && (
            <span className='flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full bg-red-500 text-white text-[10px] font-bold shrink-0'>
              {unreadCount > 99 ? '99+' : unreadCount}
            </span>
          )}
        </div>
      </div>
    </button>
  )
}
