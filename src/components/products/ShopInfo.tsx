'use client'

import Image from 'next/image'
import Link from 'next/link'
import { formatDistanceToNow } from 'date-fns'
import { vi } from 'date-fns/locale'
import { openChatWithShop } from '~/components/chat/ChatWidget'

interface ShopInfoProps {
  shop: {
    id: string;
    name: string;
    logo: string | null;
    productCount: number;
    createdAt: string;
  };
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
    <div className='bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-8 shadow-sm'>
      <div className='flex flex-col md:flex-row md:items-center justify-between gap-8'>
        <div className='flex items-center gap-8'>
          <div className='relative shrink-0'>
            {shop.logo ? (
              <Image
                src={shop.logo}
                alt={shop.name}
                width={96}
                height={96}
                className='w-24 h-24 rounded-full border-4 border-slate-50 object-cover shadow-sm'
              />
            ) : (
              <div className='flex h-24 w-24 items-center justify-center rounded-full border-4 border-slate-50 bg-emerald-600 text-2xl font-bold text-white shadow-sm'>
                {getInitials(shop.name)}
              </div>
            )}
          </div>

          <div className='flex flex-col gap-1'>
            <h3 className='font-bold text-xl lg:text-2xl text-slate-900 dark:text-slate-100'>
              {shop.name}
            </h3>
            <div className='flex flex-wrap items-center gap-y-1 gap-x-4 mt-1'>
              <div className='text-xs text-slate-600 dark:text-slate-400 font-medium'>
                Sản phẩm:{' '}
                <span className='text-emerald-600'>{shop.productCount}</span>
              </div>
              <div className='text-xs text-slate-600 dark:text-slate-400 font-medium'>
                Tham gia: <span className='text-emerald-600'>{joinedTime}</span>
              </div>
            </div>

            <div className='flex gap-3 mt-4'>
              <button
                onClick={() => openChatWithShop(shop.id, shop.name)}
                className='flex items-center justify-center gap-2 border-2 border-emerald-600 text-emerald-600 px-5 py-2 text-sm font-semibold rounded-lg bg-emerald-50 dark:bg-emerald-900/10 hover:bg-emerald-600/10 transition-colors'
              >
                <svg
                  className='h-5 w-5'
                  fill='none'
                  stroke='currentColor'
                  viewBox='0 0 24 24'
                >
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth={2}
                    d='M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z'
                  />
                </svg>
                Chat Ngay
              </button>
              <Link
                href={`/shop/${shop.id}`}
                className='flex items-center justify-center gap-2 border-2 border-slate-200 dark:border-slate-700 px-5 py-2 text-sm font-semibold rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition-colors'
              >
                <svg
                  className='h-5 w-5'
                  fill='none'
                  stroke='currentColor'
                  viewBox='0 0 24 24'
                >
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth={2}
                    d='M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6'
                  />
                </svg>
                Xem Shop
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
