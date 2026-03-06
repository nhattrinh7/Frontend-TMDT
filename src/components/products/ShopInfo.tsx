'use client'

import Image from 'next/image'
import Link from 'next/link'
import { formatDistanceToNow } from 'date-fns'
import { vi } from 'date-fns/locale'
import { openChatWithShop } from '~/app/components/chat-widget/ChatWidget'

interface ShopInfoProps {
  shop: {
    id: string
    name: string
    logo: string | null
    productCount: number
    createdAt: string
  }
}

export function ShopInfo({ shop }: ShopInfoProps) {
  const joinedTime = formatDistanceToNow(new Date(shop.createdAt), {
    addSuffix: true,
    locale: vi,
  })

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((word) => word[0])
      .join('')
      .substring(0, 2)
      .toUpperCase()
  }

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6">
      <div className="flex items-center justify-between">
        {/* Logo và tên shop bên trái */}
        <div className="flex gap-4">
          {/* Logo */}
          <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-full border-2 border-gray-200">
            {shop.logo ? (
              <Image
                src={shop.logo}
                alt={shop.name}
                fill
                className="object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-[#004643] text-xl font-bold text-white">
                {getInitials(shop.name)}
              </div>
            )}
          </div>

          {/* Tên shop và buttons */}
          <div className="space-y-3">
            <h3 className="text-2xl font-bold text-gray-900">{shop.name}</h3>
            
            {/* Buttons */}
            <div className="flex gap-3">
              <button
                onClick={() => openChatWithShop(shop.id, shop.name)}
                className="rounded-lg border-2 border-[#004643] bg-white px-6 py-2 text-sm font-medium text-[#004643] transition-all hover:bg-gray-50"
              >
                <span className="flex items-center gap-2">
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                  Chat Ngay
                </span>
              </button>
              <Link
                href={`/shop/${shop.id}`}
                className="rounded-lg border-2 border-gray-300 bg-white px-6 py-2 text-sm font-medium text-gray-700 transition-all hover:border-gray-400"
              >
                <span className="flex items-center gap-2">
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                  </svg>
                  Xem Shop
                </span>
              </Link>
            </div>
          </div>
        </div>

        {/* Stats bên phải */}
        <div className="flex items-center gap-12 text-lg text-gray-600">
          <div className="flex items-center gap-2">
            <span className="font-medium text-gray-500">Sản phẩm:</span>
            <span className="text-xl font-bold text-[#004643]">{shop.productCount}</span>
          </div>
          <div className="h-8 w-px bg-gray-300"></div>
          <div className="flex items-center gap-2">
            <span className="font-medium text-gray-500">Tham gia:</span>
            <span className="text-xl font-bold text-[#004643]">{joinedTime}</span>
          </div>
        </div>
      </div>
    </div>
  )
}
