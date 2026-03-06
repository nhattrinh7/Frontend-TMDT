'use client'

import Image from 'next/image'
import { MessageCircle } from 'lucide-react'
import { openChatWithShop } from '~/app/components/chat-widget/ChatWidget'

interface ShopBannerProps {
  shop: {
    id: string
    name: string
    description: string
    logo: string | null
  }
}

export default function ShopBanner({ shop }: ShopBannerProps) {
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((word) => word[0])
      .join('')
      .substring(0, 2)
      .toUpperCase()
  }

  return (
    <div className='bg-linear-to-r from-[#004643] to-[#005d58] rounded-lg p-8 shadow-lg mb-6'>
      <div className='flex items-start gap-8'>
        {/* Phần bên trái: Logo + Tên + Nút Chat */}
        <div className='flex items-center gap-6'>
          {/* Logo */}
          <div className='relative h-28 w-28 shrink-0 overflow-hidden rounded-full border-4 border-white shadow-lg bg-white'>
            {shop.logo ? (
              <Image
                src={shop.logo}
                alt={shop.name}
                fill
                className='object-cover'
              />
            ) : (
              <div className='flex h-full w-full items-center justify-center bg-[#ABD1C6] text-3xl font-bold text-[#004643]'>
                {getInitials(shop.name)}
              </div>
            )}
          </div>

          {/* Tên shop và nút Chat */}
          <div>
            <h1 className='text-3xl font-bold text-white mb-4'>{shop.name}</h1>
            
            {/* Nút Chat */}
            <button
              onClick={() => openChatWithShop(shop.id, shop.name)}
              className='bg-white hover:bg-gray-100 text-[#004643] font-semibold px-6 py-2.5 rounded-lg transition-colors flex items-center gap-2 shadow-md'
            >
              <MessageCircle className='w-5 h-5' />
              Chat Ngay
            </button>
          </div>
        </div>

        {/* Phần bên phải: Description */}
        <div className='flex-1'>
          <div className='bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20'>
            <h3 className='text-white font-semibold mb-2 text-lg'>Giới thiệu</h3>
            <p className='text-[#ABD1C6] text-sm leading-relaxed'>
              {shop.description || 'Chào mừng bạn đến với cửa hàng của chúng tôi!'}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
