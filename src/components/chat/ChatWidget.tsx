'use client'

import { useState, useEffect } from 'react'
import { ChatBubble } from '~/components/chat/ChatBubble'
import { ChatPanel } from '~/components/chat/ChatPanel'
import { useChat } from '~/hooks/useChat'
import { useBoundStore } from '~/zustand/store'

// Global state cho phép các components (ShopBanner, ShopInfo) mở chat khi nhấn vào nút 'Chat ngay'
// biến này sẽ chứa 1 hàm nhận vào shopId và shopName và không trả về gì.
let setChatTarget: ((shopId: string, shopName?: string) => void) | null = null

// B2. Khi nhấn nút Chat ngay ở ShopBanner hoặc ShopInfo, cái hàm được gán cho biến setChatTarget sẽ được chạy,
// sẽ chạy setTargetShopId(), setTargetShopName() và setIsOpen(true).
// khi này các state bị thay đổi giá nên sẽ kích hoạt re-render, khi này isOpen = true nên ChatPanel sẽ bung ra
export function openChatWithShop(shopId: string, shopName?: string) {
  setChatTarget?.(shopId, shopName)
}

export function ChatWidget() {
  const user = useBoundStore((state) => state.user)
  const [isOpen, setIsOpen] = useState(false)

  // 2 trường state chỉ có giá trị khi nhấn nút Chat ngay, mở bằng bong bóng chat thì null
  const [targetShopId, setTargetShopId] = useState<string | null>(null)
  const [targetShopName, setTargetShopName] = useState<string | null>(null)

  const { totalUnread } = useChat()

  // Cái ChatWidget được đặt ở layout nên vừa vào HomePage là chạy file này luôn, useEffect lập tức được chạy
  useEffect(() => {
    // B1. và sẽ chạy cái này, code này chỉ là gán 1 hàm cho biến setChatTarget thôi, ko phải chạy code bên trong hàm
    setChatTarget = (shopId: string, shopName?: string) => {
      setTargetShopId(shopId)
      setTargetShopName(shopName || null)
      setIsOpen(true)
    }
    return () => {
      setChatTarget = null
    }
  }, [])

  // Chỉ hiện chat widget khi user đã đăng nhập
  if (!user) return null

  return (
    <>
      <ChatBubble
        totalUnread={totalUnread}
        isOpen={isOpen}
        onClick={() => setIsOpen(true)}
      />
      {isOpen && (
        <ChatPanel
          onClose={() => {
            setIsOpen(false)
            setTargetShopId(null)
            setTargetShopName(null)
          }}
          onMinimize={() => setIsOpen(false)}
          initialShopId={targetShopId}
          initialShopName={targetShopName}
        />
      )}
    </>
  )
}
