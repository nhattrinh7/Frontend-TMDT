import http from '~/config/http'
import { ApiResponse } from '~/interface/response.interface'
import { MESSAGE_TYPE, type SenderType, type MessageType } from '~/constants/chat.constant'

// === Types ===
export interface ChatConversation {
  id: string
  userId: string
  shopId: string
  lastMessageId: string | null
  lastMessageContent: string | null
  lastMessageType: MessageType | null
  lastMessageAt: string | null
  lastMessageSenderId: string | null
  lastMessageSenderType: SenderType | null
  unreadCountUser: number
  unreadCountShop: number
  lastReadMessageIdUser: string | null
  lastReadMessageIdShop: string | null
  createdAt: string
  updatedAt: string
  // FE enrichment fields (populated after API call)
  shopName?: string
  shopLogo?: string | null
  userName?: string
  userAvatar?: string | null
}

export interface ChatMessage {
  id: string
  conversationId: string
  senderId: string
  senderType: SenderType
  messageType: MessageType
  message: string | null
  replyToMessageId: string | null
  replyToMessageContent: string | null
  replyToSenderType: SenderType | null
  isDeleted: boolean
  createdAt: string
}

export interface CursorMeta {
  nextCursor: string | null
  hasMore: boolean
  limit: number
}

// === API Functions ===

// Lấy danh sách conversations
export const getConversationsAPI = async (params: {
  type: 'user' | 'shop'
  shopId?: string
  cursor?: string
  limit?: number
}) => {
  const searchParams = new URLSearchParams()
  searchParams.set('type', params.type)
  if (params.shopId) searchParams.set('shopId', params.shopId)
  if (params.cursor) searchParams.set('cursor', params.cursor)
  if (params.limit) searchParams.set('limit', String(params.limit))

  const response = await http.get<ApiResponse<ChatConversation[]> & { meta: CursorMeta }>(
    `/api/v1/chats/conversations?${searchParams.toString()}`
  )
  return response
}

// Check xem conversation đã tồn tại chưa (dùng khi click Chat ngay)
export const checkConversationAPI = async (shopId: string) => {
  const response = await http.get<ApiResponse<ChatConversation | null>>(
    `/api/v1/chats/conversations/check?shopId=${shopId}`
  )
  return response
}

// Lấy messages trong 1 conversation
export const getMessagesAPI = async (conversationId: string, cursor?: string, limit?: number) => {
  const searchParams = new URLSearchParams()
  if (cursor) searchParams.set('cursor', cursor)
  if (limit) searchParams.set('limit', String(limit))

  const queryString = searchParams.toString()
  const url = `/api/v1/chats/conversations/${conversationId}/messages${queryString ? `?${queryString}` : ''}`
  
  const response = await http.get<ApiResponse<ChatMessage[]> & { meta: CursorMeta }>(url)
  return response
}

// Gửi tin nhắn text
export const sendTextMessageAPI = async (data: {
  shopId: string
  senderId: string
  senderType: SenderType
  message: string
  replyToMessageId?: string | null
  userId?: string // userId of buyer (for shop sending)
}) => {
  const formData = new FormData()
  formData.append('shopId', data.shopId)
  formData.append('senderId', data.senderId)
  formData.append('senderType', data.senderType)
  formData.append('messageType', MESSAGE_TYPE.TEXT)
  formData.append('message', data.message)
  if (data.replyToMessageId) formData.append('replyToMessageId', data.replyToMessageId)
  if (data.userId) formData.append('userId', data.userId)

  const response = await http.post<ApiResponse<ChatMessage>>('/api/v1/chats/conversations/messages', formData)
  return response
}

// Gửi tin nhắn ảnh
export const sendImageMessageAPI = async (data: {
  shopId: string
  senderId: string
  senderType: SenderType
  file: File
  replyToMessageId?: string | null
  userId?: string
}) => {
  const formData = new FormData()
  formData.append('shopId', data.shopId)
  formData.append('senderId', data.senderId)
  formData.append('senderType', data.senderType)
  formData.append('messageType', MESSAGE_TYPE.IMAGE)
  formData.append('file', data.file)
  if (data.replyToMessageId) formData.append('replyToMessageId', data.replyToMessageId)
  if (data.userId) formData.append('userId', data.userId)

  const response = await http.post<ApiResponse<ChatMessage>>('/api/v1/chats/conversations/messages', formData)
  return response
}

// Đánh dấu đã đọc
// Được gọi khi người nhận nhấn vào conversation hoặc Khi người dùng ĐANG MỞ SẴN cửa sổ của cuộc hội thoại đó
export const markAsReadAPI = async (conversationId: string, readById: string, readByType: SenderType) => {
  await http.patch<ApiResponse>(`/api/v1/chats/conversations/${conversationId}/read`, { readById, readByType })
}

// Xóa tin nhắn (soft delete)
export const deleteMessageAPI = async (messageId: string, requesterId: string, requesterType: SenderType) => {
  await http.delete<ApiResponse>(
    `/api/v1/chats/messages/${messageId}?requesterId=${requesterId}&requesterType=${requesterType}`
  )
}

// Lấy số conversation có tin nhắn chưa đọc để hiển thị lên ChatBubble
export const getTotalUnreadCountAPI = async (type: 'user' | 'shop', shopId?: string) => {
  const searchParams = new URLSearchParams()
  searchParams.set('type', type)
  if (shopId) searchParams.set('shopId', shopId)

  const response = await http.get<ApiResponse<{ totalUnread: number }>>(
    `/api/v1/chats/unread-count?${searchParams.toString()}`
  )
  return response
}
