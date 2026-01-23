'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Search, ShoppingCart, Globe, User } from 'lucide-react'
import { useBoundStore } from '~/zustand/store'
import { getAccessTokenFromLocalStorage } from '~/lib/utils'
import { useEffect } from 'react'
import { checkUserHasShopAPI } from '~/apiRequests/shop.apiRequest'

export default function Header() {
  const [searchValue, setSearchValue] = useState('')
  const [hasShop, setHasShop] = useState(false)
  const user = useBoundStore((state) => state.user)

  const accessToken = getAccessTokenFromLocalStorage()

  // Gọi api check xem tài khoản này có shop nào chưa
  useEffect(() => {
    if (!user) return
    
    const checkUserHasShopOrNot = async () => {
      try {
        const response = await checkUserHasShopAPI()
        setHasShop(response.data.hasShop)
      } catch {
        // Ignore error
      }
    }
    checkUserHasShopOrNot()
  }, [user])

  // Get first letter of username for avatar
  const getInitials = (username: string) => {
    return username?.charAt(0).toUpperCase() || 'U'
  }

  return (
    <header className='w-full bg-linear-to-r from-[#004643] to-[#005d58] shadow-lg'>
      {/* Top Navigation Bar - Hidden on mobile */}
      <div className='hidden md:flex items-center justify-center border-b border-white/10'>
        <div className='w-full max-w-400 flex items-center justify-between px-4 lg:px-6 py-2 text-sm text-white'>
          <div className='flex items-center gap-4 lg:gap-6'>
            {hasShop 
              ? (
                <Link href='/shop/orders' className='hover:text-[#ABD1C6] transition-colors font-semibold'>
                  Kênh Người Bán
                </Link>
              )
              : (
                <Link href='/create-shop' className='hover:text-[#ABD1C6] transition-colors font-semibold'>
                  Đăng kí bán hàng
                </Link>
              )
            }
            
            <Link href='/admin/users' className='hover:text-[#ABD1C6] transition-colors font-semibold'>
              Kênh Quản Lý
            </Link>
          </div>
          <div className='flex items-center gap-2 lg:gap-4'>
            <button className='hover:text-[#ABD1C6] transition-colors flex items-center gap-1.5 font-semibold'>
              <Globe className='w-4 h-4' />
              <span className='text-xs lg:text-sm'>Tiếng Việt</span>
            </button>
            {/* <ModeToggle /> */}
            <div className='h-4 w-px bg-white/30'></div>
            
            {accessToken && user ? (
              // Logged in user
              <Link href='/profile' className='px-3 py-1.5 rounded-md hover:bg-white/10 transition-all flex items-center gap-2 font-semibold'>
                {user.avatar ? (
                  <div className='relative w-8 h-8 rounded-full overflow-hidden shrink-0'>
                    <Image 
                      src={user.avatar} 
                      alt={user.username}
                      fill
                      className='object-cover'
                    />
                  </div>
                ) : (
                  <div className='w-8 h-8 rounded-full bg-[#ABD1C6] text-[#004643] flex items-center justify-center font-bold text-base shrink-0'>
                    {getInitials(user.username)}
                  </div>
                )}
                <span className='hidden lg:inline'>{user.username}</span>
              </Link>
            ) : (
              // Not logged in
              <>
                <Link href='/login' className='px-3 py-1.5 rounded-md hover:bg-white/10 transition-all flex items-center gap-1.5 font-semibold'>
                  <User className='w-4 h-4' />
                  <span className='hidden lg:inline'>Đăng Nhập</span>
                </Link>
                <Link href='/register' className='px-3 py-1.5 rounded-md hover:bg-white/20 transition-all font-semibold'>
                  <span className='hidden lg:inline'>Đăng Ký</span>
                  <span className='lg:hidden'>Ký</span>
                </Link>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Main Header */}
      <div className='flex items-center justify-center'>
        <div className='w-full max-w-400 px-4 lg:px-6 py-4 lg:py-5'>
          <div className='flex items-center justify-between gap-3 lg:gap-6'>
            {/* Logo */}
            <div className='flex items-center gap-2 lg:gap-3 shrink-0'>
              <div className='w-10 h-10 lg:w-14 lg:h-14 bg-white rounded-full flex items-center justify-center shadow-md'>
                <span className='text-[#004643] font-bold text-lg lg:text-2xl'>S</span>
              </div>
              <span className='text-white font-bold text-xl lg:text-3xl tracking-tight'>
                Szone
              </span>
            </div>

            {/* Search Bar - Desktop */}
            <div className='hidden md:flex flex-1 justify-center mx-4 lg:mx-8'>
              <div className='w-full max-w-5xl flex items-stretch bg-white rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-shadow'>
                <input
                  type='text'
                  placeholder='Tìm kiếm sản phẩm, cửa hàng...'
                  value={searchValue}
                  onChange={(e) => setSearchValue(e.target.value)}
                  className='flex-1 px-5 py-3.5 lg:py-4 text-base lg:text-lg text-gray-700 focus:outline-none placeholder:text-gray-400'
                />
                <button className='bg-linear-to-r from-[#FF6B35] to-[#FF5722] hover:from-[#FF5722] hover:to-[#FF4500] text-white px-6 lg:px-8 py-3.5 lg:py-4 flex items-center justify-center transition-all'>
                  <Search className='w-6 h-6 lg:w-7 lg:h-7' />
                </button>
              </div>
            </div>

            {/* Cart */}
            <button className='relative shrink-0 p-2 hover:bg-white/10 rounded-lg transition-all group'>
              <ShoppingCart className='w-7 h-7 lg:w-8 lg:h-8 text-white group-hover:scale-110 transition-transform' />
              <span className='absolute -top-1 -right-1 bg-linear-to-r from-red-500 to-red-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold shadow-md'>
                1
              </span>
            </button>
          </div>

          {/* Search Bar - Mobile */}
          <div className='md:hidden mt-3'>
            <div className='flex items-stretch bg-white rounded-lg overflow-hidden shadow-md'>
              <input
                type='text'
                placeholder='Tìm kiếm...'
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                className='flex-1 px-4 py-3 text-base text-gray-700 focus:outline-none placeholder:text-gray-400'
              />
              <button className='bg-linear-to-r from-[#FF6B35] to-[#FF5722] text-white px-5 py-3 flex items-center justify-center'>
                <Search className='w-6 h-6' />
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}