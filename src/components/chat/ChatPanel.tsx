'use client'

import { useState, useEffect, useRef, useCallback, type KeyboardEvent } from 'react'
import { X, Minus, Send, ImageIcon, ChevronLeft, Loader2 } from 'lucide-react'
import { ScrollArea } from '~/components/ui/scroll-area'
import { cn } from '~/lib/utils'
import { toast } from 'sonner'
import { ConversationItem } from './ConversationItem'
import { MessageItem, ReplyBar } from './MessageItem'
import type { ChatConversation, ChatMessage } from '~/apiRequests/chat.apiRequest'
import {
  getConversationsAPI,
  getMessagesAPI,
  sendTextMessageAPI,
  sendImageMessageAPI,
  markAsReadAPI,
  deleteMessageAPI,
  checkConversationAPI,
} from '~/apiRequests/chat.apiRequest'
import { SENDER_TYPE } from '~/constants/chat.constant'
import { useBoundStore } from '~/zustand/store'
import { useChat } from '~/hooks/useChat'
import { useInfiniteScroll } from '~/hooks/useInfiniteScroll'

interface ChatPanelProps {
  onClose: () => void
  onMinimize: () => void
  initialShopId?: string | null
  initialShopName?: string | null
}

export function ChatPanel({ onClose, onMinimize, initialShopId, initialShopName }: ChatPanelProps) {
  const user = useBoundStore((state) => state.user)
  const [conversations, setConversations] = useState<ChatConversation[]>([])
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [messageText, setMessageText] = useState('')
  const [replyTo, setReplyTo] = useState<ChatMessage | null>(null)
  const [loadingConvs, setLoadingConvs] = useState(true)
  const [loadingMsgs, setLoadingMsgs] = useState(false)
  const [sending, setSending] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [newChatShop, setNewChatShop] = useState<{ shopId: string; shopName: string } | null>(null)

  // Infinity scroll state — Conversations
  const [convCursor, setConvCursor] = useState<string | null>(null)
  const [convHasMore, setConvHasMore] = useState(false)
  const [loadingMoreConvs, setLoadingMoreConvs] = useState(false)

  // Infinity scroll state — Messages
  const [msgCursor, setMsgCursor] = useState<string | null>(null)
  const [msgHasMore, setMsgHasMore] = useState(false)
  const [loadingMoreMsgs, setLoadingMoreMsgs] = useState(false)
  const messagesViewportRef = useRef<HTMLDivElement>(null)

  const { onNewMessage, onConversationUpdated, onMessageDeleted, onMessagesRead } = useChat()

  // === Infinity Scroll — Conversations (cuộn xuống) ===
  const loadMoreConversations = useCallback(async () => {
    if (!convCursor || loadingMoreConvs) return
    try {
      setLoadingMoreConvs(true)
      const res = await getConversationsAPI({ type: 'user', cursor: convCursor })
      
      setConversations(prev => {
        const newConvs = res.data || []
        // Lọc bỏ những conversation bị trùng (đã có trong state trước đó)
        const filteredNewConvs = newConvs.filter(newC => !prev.some(p => p.id === newC.id))
        return [...prev, ...filteredNewConvs]
      })
      
      setConvCursor(res.meta?.nextCursor || null)
      setConvHasMore(res.meta?.hasMore || false)
    } catch {
      toast.error('Không thể tải thêm cuộc trò chuyện')
    } finally {
      setLoadingMoreConvs(false)
    }
  }, [convCursor, loadingMoreConvs])

  const { sentinelRef: convSentinelRef } = useInfiniteScroll({
    onLoadMore: loadMoreConversations,
    hasMore: convHasMore,
    isLoading: loadingMoreConvs,
  })

  // === Infinity Scroll — Messages (cuộn lên) ===
  const loadMoreMessages = useCallback(async () => {
    if (!msgCursor || !activeConversationId || loadingMoreMsgs) return
    try {
      setLoadingMoreMsgs(true)

      // Ghi lại scrollHeight trước khi prepend để giữ scroll position
      const viewport = messagesViewportRef.current
      const prevScrollHeight = viewport?.scrollHeight || 0

      const res = await getMessagesAPI(activeConversationId, msgCursor)
      const olderMessages = res.data || []

      setMessages(prev => [...olderMessages, ...prev])
      setMsgCursor(res.meta?.nextCursor || null)
      setMsgHasMore(res.meta?.hasMore || false)

      // Giữ scroll position sau khi prepend tin nhắn cũ
      requestAnimationFrame(() => {
        const viewport = messagesViewportRef.current?.closest('[data-radix-scroll-area-viewport]') as HTMLElement | null
        if (viewport) {
          const newScrollHeight = viewport.scrollHeight
          viewport.scrollTop += newScrollHeight - prevScrollHeight
        }
      })
    } catch {
      toast.error('Không thể tải thêm tin nhắn')
    } finally {
      setLoadingMoreMsgs(false)
    }
  }, [msgCursor, activeConversationId, loadingMoreMsgs])

  const { sentinelRef: msgSentinelRef } = useInfiniteScroll({
    onLoadMore: loadMoreMessages,
    hasMore: msgHasMore,
    isLoading: loadingMoreMsgs,
  }) 

  // Load conversations on mount
  useEffect(() => {
    loadConversations()
  }, [])

  // Chỉ chạy khi bấm vào nút Chat ngay ở ShopBanner hoặc ShopInfo
  // khi danh sách conversations được load xong hoặc có conversation mới
  // Còn khi mở bằng bong bóng chat thì ko chạy code trong useEffect này vì initialShopId = null
  useEffect(() => {
    // Chờ loadConversations() chạy xong rồi mới check, tránh gọi checkConversationAPI thừa 1 lần
    // khi mảng conversations còn rỗng (chưa load xong từ API)
    if (initialShopId && !loadingConvs) {
      const checkAndSetActive = async () => {
        // Kiểm tra xem có conversation nào với shop này chưa (tức là đã từng nhắn tín với shop này chưa)
        // Nếu đã rồi thì tự động tìm tới conversation đó và load tin nhắn cũ setActiveConversationId(existing.id)
        // Còn nếu chưa thì tạo conversation mới setNewChatShop({ shopId: initialShopId, shopName: initialShopName || 'Shop' })
        const existing = conversations.find(c => c.shopId === initialShopId)
        if (existing) {
          setActiveConversationId(existing.id)
          setNewChatShop(null)
        } else {
          // Không có trong mảng hiện tại, chủ động hỏi BE xem đã từng chat chưa
          const res = await checkConversationAPI(initialShopId)
          
          if (res.data) {
            // User với shop này có conversation từ trước rồi -> push lên đầu mảng để hiển thị
            setConversations(prev => [res.data!, ...prev])
            setActiveConversationId(res.data.id)
            setNewChatShop(null)
          } else {
            // New conversation (lazy creation) - chỉ khi gửi tin nhắn đầu tiên mới tạo conversation mới
            // cụ thể xem dưới hàm handleSendText()
            setNewChatShop({ shopId: initialShopId, shopName: initialShopName || `Shop ${initialShopId.slice(0, 6)}` })

            // vốn state khi khởi tạo mang giá trị null rồi, nhưng ở đây vẫn set lại null để phòng trường hợp:
            // 1. user đang chat với 1 shop A đã có trong danh sách conversations, activeConversationId mang gtri id của shop A
            // 2. user minimize ChatPanel, việc minimize chỉ đóng ChatPanel lại chứ ko xóa giá trị state activeConversationId
            // 3. Sau đó vào shop B và bấn Chat ngay, shop B là shop chưa chat bao giờ, prop initialShopId thay đổi thành ID của Shop B.
            // 4. useEffect này chạy, ở đây mà ko setActiveConversationId(null) thì activeConversationId vẫn mang giá trị id của shop A
            setActiveConversationId(null)

            // Đang hiển thị các tin nhắn cũ của shop A, sau đó nhấn nút Chat ngay với shop B chưa chat bao giờ, thì cần
            // setMessages([]) nhằm xóa đi các tin nhắn cũ của shop A, bắt đầu chat với shop B với lịch sử tin nhắn trống.
            setMessages([])
          }
        }
      }
      
      checkAndSetActive()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialShopId, conversations.length])
  // conversations.length ở đây là cần thiết để tránh tạo mới conversation, giải thích:
  // useEffect này với useEffect ngay phía trên được chạy đồng thời khi component ChatPanel được mount. 
  // trong trường hợp user bấm Chat ngay với 1 shop mà user từng chat với shop đó rồi. 
  // khi bấm Chat ngay sẽ chạy code trong if (initialShopId){}, nhưng có thể khi này chưa chạy xong loadConversations() 
  // vì API chạy cần thời gian mà. Nên state conversations tại thời điểm ban đầu là 1 mảng rỗng. 
  // dòng const existing = conversations.find(c => c.shopId === initialShopId) tìm ko thấy conversation của user với shop đó 
  // thì sẽ chạy xuống phần else, tức là sẽ chạy dòng 
  // setNewChatShop({ shopId: initialShopId, shopName: initialShopName || `Shop ${initialShopId.slice(0, 6)}` }) để lăm le tạo conversation mới ko cần thiết,
  // quá nguy hiểm. Tuy nhiên nhờ có conversations.length trong deps của useEffect này nên khi loadConversations() chạy xong,
  // state conversations được cập nhật thì useEffect này được chạy lại và lần này 
  // const existing = conversations.find(c => c.shopId === initialShopId) đã check ra được conversation của user với shop đó,
  // nên sẽ chạy lại code trong phần if(existing). trong if(existing) ta setNewChatShop(null) để xóa bỏ cái rủi ro tạo
  // conversation mới ko cần thiết. 


  // Load messages when active conversation changes
  useEffect(() => {
    if (activeConversationId) {
      loadMessages(activeConversationId)
      // Mark as read tất cả các tin nhắn chưa đọc của conversation
      markAsReadAPI(activeConversationId, user?.id || '', SENDER_TYPE.USER).catch(() => {})
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeConversationId])

  // Socket.IO event listeners
  useEffect(() => {
    // chạy mỗi khi BE bắn event chat:newMessage
    onNewMessage((newMsg) => {
      // Nếu đang xem conversation này → thêm message vào list
      if (newMsg.conversationId === activeConversationId) {
        setMessages(prev => [...prev, newMsg])
        // Auto mark as read (Chỉ đánh dấu đã đọc nếu tin nhắn là của ĐỐI PHƯƠNG)
        if (newMsg.senderType !== SENDER_TYPE.USER) {
          markAsReadAPI(newMsg.conversationId, user?.id || '', SENDER_TYPE.USER).catch(() => {})
        }
      }

      // Nếu là new conversation 
      if (newChatShop && newMsg.senderType === SENDER_TYPE.USER) {
        // BE tạo 1 conversation mới và gửi về, FE set id này vào activeConversationId và load lại danh sách conversation
        setActiveConversationId(newMsg.conversationId)
        setNewChatShop(null) // xóa đi vì giờ tạo conversation mới xong rồi
        loadConversations()
      }
    })

    // chạy mỗi khi BE bắn event chat:conversationUpdated
    onConversationUpdated((updatedConv) => {
      // cập nhật và sắp xếp lại danh sách conversations, tìm conversation nào có id trùng với updatedConv.id thì merge 
      // dữ liệu mới vào, tiếp theo là sắp xếp lại theo updatedAt giảm dần để conversation có message mới nhất lên đầu
      setConversations(prev =>
        prev.map(c => c.id === updatedConv.id ? { ...c, ...updatedConv } : c)
          .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
      )
      // Nếu la conversation mới (lazy creation) → reload list
      // vốn là ko cần loadConversations() khi có conversation mới vì khi BE tạo conversation mới sẽ bắn cả 2 event
      // chat:newMessage và chat:conversationUpdated nên ở onNewMessage đã loadConversations() rồi, những vẫn gọi 
      // loadConversations() ở đây vì tốt cho trường hợp multi-tab/multi-device.
      if (!conversations.find(c => c.id === updatedConv.id)) {
        loadConversations()
      }
    })

    // chạy mỗi khi BE bắn event chat:messageDeleted
    onMessageDeleted((data) => {
      if (data.conversationId === activeConversationId) {
        // cập nhật lại message bị xóa
        setMessages(prev =>
          prev.map(m => m.id === data.messageId ? { ...m, isDeleted: true, message: null } : m)
        )
      }
    })

    // chạy mỗi khi BE bắn event chat:messagesRead
    onMessagesRead((data) => {
      // Cập nhật unreadCount của đúng conversation đó (của bên nhận)
      setConversations(prev =>
        prev.map(c => c.id === data.conversationId
          ? {
            ...c,
            unreadCountUser: data.readByType === 'USER' ? 0 : c.unreadCountUser,
            unreadCountShop: data.readByType === 'SHOP' ? 0 : c.unreadCountShop,
            lastReadMessageIdUser: data.readByType === 'USER' ? data.lastReadMessageId : c.lastReadMessageIdUser,
            lastReadMessageIdShop: data.readByType === 'SHOP' ? data.lastReadMessageId : c.lastReadMessageIdShop,
          }
          : c
        )
      )
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeConversationId, newChatShop])

  // Scroll to bottom when new messages (chỉ khi load lần đầu hoặc nhận tin mới, KHÔNG khi load thêm tin cũ)
  const isInitialMsgLoad = useRef(true)

  const scrollToBottom = useCallback((behavior: ScrollBehavior = 'smooth') => {
    const viewport = messagesEndRef.current?.closest('[data-radix-scroll-area-viewport]') as HTMLElement | null
    if (viewport) {
      viewport.scrollTo({ top: viewport.scrollHeight, behavior })
    } else {
      // Fallback
      messagesEndRef.current?.scrollIntoView({ behavior, block: 'end' })
    }
  }, [])

  useEffect(() => {
    // Luôn cuộn xuống mỗi khi danh sách tin nhắn thay đổi (kể cả lúc Init và nhận tin mới)
    requestAnimationFrame(() => scrollToBottom('smooth'))
    // requestAnimationFrame là 1 build-in web API. Về cách hoạt động thì:
    // Màn hình ví dụ 60FPS thì 16.6ms sẽ vẽ lại màn hình 1 lần - gọi là repaint. lệnh requestAnimationFrame(hàm_x)
    // yêu cầu trình duyệt gọi hàm_x ngay trước lần repaint kế tiếp
    // messages nằm trong deps của useEffect này, mỗi khi có tin nhắn mới thì messages sẽ thay đổi
    // dẫn đến gọi lại requestAnimationFrame và cuộn xuống để ta nhìn thấy tin nhắn mới.

    // dùng requestAnimationFrame() thay vì gọi scrollToBottom trực tiếp là vì:
    // khi load lần đầu hay nhận tin nhắn mới, việc cập nhật DOM và tính toán lại layout có thể chưa hoàn thành ngay lập tức,
    // chiều cao vẫn là chiều cao cũ thì có thực hiện scroll cũng ko scroll hẳn xuống đáy thực sự được.
    // requestAnimationFrame đảm bảo việc cuộn chỉ diễn ra sau khi DOM và layout đã được cập nhật, đồng nghĩa với việc chiều cao
    // thực sự đã được tính toán xong, đảm bảo luôn scroll xuống đến tin nhắn cuối cùng.
    
    // Nếu là load lần đầu thì đánh dấu đã qua stage đó (để có thể xử lý việc cuộn ngược InfinityScroll sau này)
    if (isInitialMsgLoad.current && messages.length > 0) {
      isInitialMsgLoad.current = false
    }
  }, [messages, scrollToBottom])

  const loadConversations = async () => {
    try {
      setLoadingConvs(true)
      const res = await getConversationsAPI({ type: 'user' })
      setConversations(res.data || [])
      setConvCursor(res.meta?.nextCursor || null)
      setConvHasMore(res.meta?.hasMore || false)
    } catch {
      toast.error('Không thể tải cuộc trò chuyện, thử lại sau')
    } finally {
      setLoadingConvs(false)
    }
  }

  const loadMessages = async (conversationId: string) => {
    try {
      setLoadingMsgs(true)
      isInitialMsgLoad.current = true
      const res = await getMessagesAPI(conversationId)
      setMessages(res.data || [])
      setMsgCursor(res.meta?.nextCursor || null)
      setMsgHasMore(res.meta?.hasMore || false)
    } catch {
      toast.error('Không thể tải tin nhắn, thử lại sau')
    } finally {
      setLoadingMsgs(false)
      // Sau lần load đầu tiên, tắt auto-scroll-to-bottom cho load thêm tin cũ
      setTimeout(() => { isInitialMsgLoad.current = false }, 100)
    }
  }

  const handleSendText = async () => {
    if (!messageText.trim() || sending) return
    const shopId = newChatShop?.shopId || conversations.find(c => c.id === activeConversationId)?.shopId
    if (!shopId || !user) return

    try {
      setSending(true)
      // hàm này có truyền shopId cả userId. BE sẽ check xem có tồn tại conversation giữa shop và user này ko,
      // nếu ko thì sẽ tạo mới conversation
      await sendTextMessageAPI({
        shopId,
        senderId: user.id,
        senderType: SENDER_TYPE.USER,
        message: messageText.trim(),
        replyToMessageId: replyTo?.id || null,
      })
      setMessageText('')
      setReplyTo(null)
    } catch {
      toast.error('Không thể gửi tin nhắn')
    } finally {
      setSending(false)
    }
  }

  const handleSendImage = async (file: File) => {
    const shopId = newChatShop?.shopId || conversations.find(c => c.id === activeConversationId)?.shopId
    if (!shopId || !user) return

    try {
      setSending(true)
      await sendImageMessageAPI({
        shopId,
        senderId: user.id,
        senderType: SENDER_TYPE.USER,
        file,
        replyToMessageId: replyTo?.id || null,
      })
      setReplyTo(null)
    } catch {
      toast.error('Không thể gửi hình ảnh')
    } finally {
      setSending(false)
    }
  }

  const handleDeleteMessage = async (messageId: string) => {
    if (!user) return
    try {
      await deleteMessageAPI(messageId, user.id, SENDER_TYPE.USER)
    } catch {
      toast.error('Không thể xóa tin nhắn')
    }
  }

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendText()
    }
  }

  const activeConversation = conversations.find(c => c.id === activeConversationId)
  const showChatArea = activeConversationId || newChatShop
  const chatTitle = newChatShop?.shopName || activeConversation?.shopName || 'Shop'

  return (
    <div
      className='fixed bottom-6 right-6 z-100 bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden flex flex-col'
      style={{ width: 680, height: 650 }}
    >
      {/* Header */}
      <div className='bg-[#004643] text-white px-4 py-3 flex items-center justify-between shrink-0'>
        <div className='flex items-center gap-2'>
          {showChatArea && (
            <button
              onClick={() => { setActiveConversationId(null); setNewChatShop(null) }}
              className='p-1 hover:bg-white/10 rounded mr-1 lg:hidden'
            >
              <ChevronLeft className='w-4 h-4' />
            </button>
          )}
          <h3 className='font-semibold text-sm'>
            {showChatArea ? chatTitle : 'Chat'}
          </h3>
        </div>
        <div className='flex items-center gap-1'>
          <button onClick={onMinimize} className='p-1.5 hover:bg-white/10 rounded transition-colors'>
            <Minus className='w-4 h-4' />
          </button>
          <button onClick={onClose} className='p-1.5 hover:bg-white/10 rounded transition-colors'>
            <X className='w-4 h-4' />
          </button>
        </div>
      </div>

      {/* Body - 2 columns */}
      <div className='flex flex-1 overflow-hidden min-h-0'>
        {/* Left: Conversation List */}
        <div className={cn(
          'border-r border-gray-200 flex flex-col min-h-0',
          showChatArea ? 'hidden lg:flex w-1/3' : 'w-1/3',
        )}>
          <div className='px-3 py-2 border-b border-gray-100 shrink-0'>
            <p className='text-xs font-semibold text-gray-500 uppercase tracking-wider'>Cuộc trò chuyện</p>
          </div>
          <ScrollArea className='flex-1 min-h-0 overscroll-contain'>
            {loadingConvs ? (
              <div className='p-4 text-center text-xs text-gray-400'>Đang tải...</div>
            ) : conversations.length === 0 ? (
              <div className='p-4 text-center text-xs text-gray-400'>Chưa có cuộc trò chuyện nào</div>
            ) : (
              <div className='py-1'>
                {conversations.map((conv) => (
                  <ConversationItem
                    key={conv.id}
                    conversation={conv}
                    isActive={conv.id === activeConversationId}
                    onClick={() => {
                      setActiveConversationId(conv.id)
                      setNewChatShop(null)
                    }}
                    viewerType={SENDER_TYPE.USER}
                  />
                ))}
                {/* Sentinel cho infinity scroll conversations — cuộn xuống */}
                {convHasMore && (
                  <div ref={convSentinelRef} className='flex justify-center py-2'>
                    {loadingMoreConvs && <Loader2 className='w-4 h-4 animate-spin text-gray-400' />}
                  </div>
                )}
              </div>
            )}
          </ScrollArea>
        </div>

        {/* Right: Chat Area */}
        {showChatArea ? (
          <div className='flex-1 flex flex-col min-w-0 min-h-0'>
            {/* Messages */}
            <ScrollArea className='flex-1 min-h-0 overscroll-contain'>
              <div ref={messagesViewportRef} className='px-3 py-2'>
                {loadingMsgs ? (
                  <div className='flex items-center justify-center flex-1 text-xs text-gray-400'>Đang tải tin nhắn...</div>
                ) : messages.length === 0 ? (
                  <div className='flex items-center justify-center flex-1 text-xs text-gray-400'>
                    Hãy gửi tin nhắn đầu tiên!
                  </div>
                ) : (
                  <div className='space-y-1 mt-auto'>
                    {/* Sentinel cho infinity scroll messages — cuộn lên */}
                    {msgHasMore && (
                      <div ref={msgSentinelRef} className='flex justify-center py-2'>
                        {loadingMoreMsgs && <Loader2 className='w-4 h-4 animate-spin text-gray-400' />}
                      </div>
                    )}
                    {messages.map((msg) => (
                      <MessageItem
                        key={msg.id}
                        message={msg}
                        isOwnMessage={msg.senderType === SENDER_TYPE.USER}
                        onReply={(m) => setReplyTo(m)}
                        onDelete={handleDeleteMessage}
                        isSeen={msg.senderType === SENDER_TYPE.USER && msg.id === activeConversation?.lastReadMessageIdShop}
                      />
                    ))}
                    <div ref={messagesEndRef} />
                  </div>
                )}
              </div>
            </ScrollArea>

            {/* Reply bar */}
            {replyTo && <ReplyBar replyTo={replyTo} onCancel={() => setReplyTo(null)} />}

            {/* Input area */}
            <div className='border-t border-gray-200 px-3 py-2 bg-white'>
              <div className='flex items-end gap-2'>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className='p-2 text-gray-400 hover:text-[#004643] hover:bg-gray-100 rounded-lg transition-colors shrink-0'
                  title='Gửi hình ảnh'
                >
                  <ImageIcon className='w-5 h-5' />
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
                <div className='flex-1 relative'>
                  <textarea
                    value={messageText}
                    onChange={(e) => setMessageText(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder='Nhập tin nhắn...'
                    rows={1}
                    className='w-full resize-none rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-[#004643] focus:ring-1 focus:ring-[#004643] max-h-20'
                  />
                </div>
                <button
                  onClick={handleSendText}
                  disabled={!messageText.trim() || sending}
                  className={cn(
                    'p-2 rounded-lg transition-colors shrink-0',
                    messageText.trim() && !sending
                      ? 'bg-[#004643] text-white hover:bg-[#005d58]'
                      : 'bg-gray-100 text-gray-400 cursor-not-allowed',
                  )}
                >
                  <Send className='w-5 h-5' />
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className='flex-1 flex items-center justify-center text-gray-400 text-sm'>
            Chọn cuộc trò chuyện để bắt đầu
          </div>
        )}
      </div>
    </div>
  )
}
