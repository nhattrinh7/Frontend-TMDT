'use client'

import { useEffect, useRef, useState } from 'react'
import { io, Socket } from 'socket.io-client'
import type { ChatMessage, ChatConversation } from '~/apiRequests/chat.apiRequest'
import { getTotalUnreadCountAPI } from '~/apiRequests/chat.apiRequest'

const CHAT_WS_URL = process.env.NEXT_PUBLIC_CHAT_WS_URL || 'http://localhost:3004'

interface UseChatOptions {
  shopId?: string // Nếu là shop owner, truyền shopId để join room shop
}

// định nghĩa các giá trị hook trả ra cho component sử dụng
interface UseChatReturn {
  socket: Socket | null
  isConnected: boolean
  totalUnread: number
  onNewMessage: (callback: (message: ChatMessage) => void) => void
  onConversationUpdated: (callback: (conversation: ChatConversation) => void) => void
  onMessageDeleted: (callback: (data: { messageId: string; conversationId: string }) => void) => void
  onMessagesRead: (callback: (data: { conversationId: string; readById: string; readByType: string; lastReadMessageId: string }) => void) => void
}


// Custom react hook để kết nối Websocket tới chat-service, lắng nghe các sự kiện realtime.
// Nếu là shop owner, truyền shopId để join room shop
export function useChat(options?: UseChatOptions): UseChatReturn {
  const socketRef = useRef<Socket | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const [totalUnread, setTotalUnread] = useState(0)

  // 
  const newMessageCallbackRef = useRef<((message: ChatMessage) => void) | null>(null)
  const conversationUpdatedCallbackRef = useRef<((conversation: ChatConversation) => void) | null>(null)
  const messageDeletedCallbackRef = useRef<((data: { messageId: string; conversationId: string }) => void) | null>(null)
  const messagesReadCallbackRef = useRef<((data: { conversationId: string; readById: string; readByType: string; lastReadMessageId: string }) => void) | null>(null)

  useEffect(() => {
    const accessToken = localStorage.getItem('accessToken')
    if (!accessToken) return

    // B1: Tại đây khi gọi đến địa chỉ BE, FE chủ động gõ cửa BE xin kết nối. 
    // BE kiểm tra token thấy ok thì cho vào. đường hầm được thiết lập
    const socket = io(`${CHAT_WS_URL}/chat`, {
      auth: {
        token: accessToken,
        shopId: options?.shopId,
      },
      transports: ['websocket'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    })

    socketRef.current = socket

    //------------------------------
    // 2 sự kiện build in của socket.io. 

    // B2: B1 OK thì B2 FE tự kích hoạt sự kiện connect ngay trên máy user
    // Nó là 1 tiếng reo lên của FE báo hiệu Đã kết nối thành công
    socket.on('connect', () => {
      setIsConnected(true)
      
      // Khởi tạo lấy totalUnread khi vừa kết nối thành công để hiển thị badge đỏ lên ChatBubble
      const type = options?.shopId ? 'shop' : 'user'
      getTotalUnreadCountAPI(type, options?.shopId).then(res => {
        setTotalUnread(res.data.totalUnread)
      }).catch(console.error)
    })

    // Khi đường hầm bị đứt vì bất cứ lí do gì, sự kiện disconnect được kích hoạt
    // Nó là 1 tiếng kếu thông báo đường hầm đã sập
    socket.on('disconnect', () => {
      setIsConnected(false)
    })
    //---------------------------------

    // Listen for events
    socket.on('chat:newMessage', (message: ChatMessage) => {
      newMessageCallbackRef.current?.(message) // khi server bắn event về thì chạy callback đã đăng kí từ trước
    })

    socket.on('chat:conversationUpdated', (conversation: ChatConversation) => {
      conversationUpdatedCallbackRef.current?.(conversation)
    })

    socket.on('chat:messageDeleted', (data: { messageId: string; conversationId: string }) => {
      messageDeletedCallbackRef.current?.(data)
    })

    socket.on('chat:messagesRead', (data: { conversationId: string; readById: string; readByType: string; lastReadMessageId: string }) => {
      messagesReadCallbackRef.current?.(data)
    })

    socket.on('chat:totalUnreadCountUpdate', (data: { totalUnread: number }) => {
      setTotalUnread(data.totalUnread)
    })

    // cleanup khi component unmount
    return () => {
      socket.disconnect()
      socketRef.current = null
    }
  }, [options?.shopId])


  // tại component gọi các hàm này là để đăng kí 1 callback, khi server bắn event tương ứng thì mới chạy callback đó
  // mấy hàm 'on' này được chạy ngay khi component được render, nhưng các callback bên trong thì thì chạy khi server bắn event về
  const onNewMessage = (callback: (message: ChatMessage) => void) => {
    newMessageCallbackRef.current = callback // cất vào hộp thôi chứ chưa chạy
  }

  const onConversationUpdated = (callback: (conversation: ChatConversation) => void) => {
    conversationUpdatedCallbackRef.current = callback
  }

  const onMessageDeleted = (callback: (data: { messageId: string; conversationId: string }) => void) => {
    messageDeletedCallbackRef.current = callback
  }

  const onMessagesRead = (callback: (data: { conversationId: string; readById: string; readByType: string; lastReadMessageId: string }) => void) => {
    messagesReadCallbackRef.current = callback
  }

  return {
    socket: socketRef.current,
    isConnected,
    totalUnread,
    onNewMessage,
    onConversationUpdated,
    onMessageDeleted,
    onMessagesRead,
  }
}
