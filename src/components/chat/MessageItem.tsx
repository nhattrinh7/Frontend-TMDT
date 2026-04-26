'use client'

import { useState } from 'react'
import Image from 'next/image'
import { cn } from '~/lib/utils'
import { Reply, Trash2, X } from 'lucide-react'
import { format } from 'date-fns'
import type { ChatMessage } from '~/apiRequests/chat.apiRequest'
import { SENDER_TYPE, MESSAGE_TYPE } from '~/constants/chat.constant'

interface MessageItemProps {
  message: ChatMessage
  isOwnMessage: boolean
  onReply: (message: ChatMessage) => void
  onDelete: (messageId: string) => void
  isSeen?: boolean
}

export function MessageItem({ message, isOwnMessage, onReply, onDelete, isSeen }: MessageItemProps) {
  const [showActions, setShowActions] = useState(false)

  if (message.isDeleted) {
    return (
      <div className={cn('flex mb-2', isOwnMessage ? 'justify-end' : 'justify-start')}>
        <div className='px-3 py-2 rounded-lg bg-gray-100 border border-gray-200 max-w-[75%]'>
          <p className='text-xs text-gray-400 italic'>Tin nhắn đã bị xóa</p>
        </div>
      </div>
    )
  }

  const timeStr = format(new Date(message.createdAt), 'HH:mm')

  return (
    <div
      className={cn('flex mb-2 group', isOwnMessage ? 'justify-end' : 'justify-start')}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      <div className={cn('max-w-[75%] relative', isOwnMessage ? 'order-1' : 'order-2')}>
        {/* Reply preview */}
        {message.replyToMessageId && (
          <div className={cn(
            'text-[10px] px-2 py-1 mb-0.5 rounded-t-lg border-l-2',
            isOwnMessage
              ? 'bg-[#004643]/65 border-[#ABD1C6] text-white/70'
              : 'bg-gray-100 border-[#004643] text-gray-500',
          )}>
            <span className='font-medium'>
              {message.replyToSenderType === SENDER_TYPE.SHOP ? 'Shop' : 'Bạn'}
            </span>
            <p className='truncate'>
              {message.replyToMessageContent || 'Tin nhắn gốc'}
            </p>
          </div>
        )}

        {/* Message content */}
        <div className={cn(
          'px-3 py-2 rounded-lg',
          message.replyToMessageId ? 'rounded-t-none' : '',
          isOwnMessage
            ? 'bg-[#004643] text-white'
            : 'bg-white border border-gray-200 text-gray-800',
        )}>
          {message.messageType === MESSAGE_TYPE.IMAGE && message.message ? (
            <div className='rounded-md overflow-hidden'>
              <Image
                src={message.message}
                alt='Ảnh'
                width={220}
                height={220}
                className='object-cover max-h-[220px] w-auto rounded-md'
              />
            </div>
          ) : (
            <p className='text-sm whitespace-pre-wrap wrap-break-word'>{message.message}</p>
          )}
          <p className={cn(
            'text-[10px] mt-1 text-right',
            isOwnMessage ? 'text-white/60' : 'text-gray-400',
          )}>
            {timeStr}
          </p>
        </div>

        {isSeen && (
          <div className="text-[10px] text-gray-500 text-right mt-0.5 mr-1">
            Đã xem
          </div>
        )}

        {/* Action buttons on hover */}
        {showActions && (
          <div className={cn(
            'absolute top-0 flex items-center gap-0.5 bg-white border rounded-md shadow-sm p-0.5',
            isOwnMessage ? '-left-16' : '-right-16',
          )}>
            <button
              onClick={() => onReply(message)}
              className='p-1 hover:bg-gray-100 rounded text-gray-500 hover:text-[#004643]'
              title='Trả lời'
            >
              <Reply className='w-3.5 h-3.5' />
            </button>
            {isOwnMessage && (
              <button
                onClick={() => onDelete(message.id)}
                className='p-1 hover:bg-red-50 rounded text-gray-500 hover:text-red-500'
                title='Xóa'
              >
                <Trash2 className='w-3.5 h-3.5' />
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

// Reply bar hiện ở trên input khi đang reply
export function ReplyBar({
  replyTo,
  onCancel,
}: {
  replyTo: ChatMessage
  onCancel: () => void
}) {
  return (
    <div className='flex items-center gap-2 px-3 py-2 bg-gray-50 border-t border-gray-200'>
      <Reply className='w-4 h-4 text-[#004643] shrink-0' />
      <div className='flex-1 min-w-0'>
        <p className='text-[10px] font-semibold text-[#004643]'>
          Đang trả lời {replyTo.senderType === SENDER_TYPE.SHOP ? 'Shop' : 'Người dùng'}
        </p>
        <p className='text-xs text-gray-500 truncate'>
          {replyTo.messageType === MESSAGE_TYPE.IMAGE ? '📷 Hình ảnh' : replyTo.message}
        </p>
      </div>
      <button onClick={onCancel} className='p-1 hover:bg-gray-200 rounded'>
        <X className='w-3.5 h-3.5 text-gray-400' />
      </button>
    </div>
  )
}
