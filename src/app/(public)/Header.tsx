'use client'

import { useState, useCallback, useRef, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter, usePathname } from 'next/navigation'
import { Search, ShoppingCart, Globe, User } from 'lucide-react'
import { useBoundStore } from '~/zustand/store'
import { getAccessTokenFromLocalStorage } from '~/lib/utils'
import { checkUserHasShopAPI } from '~/apiRequests/shop.apiRequest'
import { addSearchHistory } from '~/lib/search-history.util'
import SearchHistoryDropdown from '~/components/SearchHistoryDropdown'
import { countCartItemsAPI } from '~/apiRequests/user.apiRequest'

export default function Header() {
  const [searchValue, setSearchValue] = useState('')
  const [shopStatus, setShopStatus] = useState<string | null>(null)
  const [showHistory, setShowHistory] = useState(false)
  const cartItemsCount = useBoundStore((state) => state.cartItemsCount)
  const setCartItemsCount = useBoundStore((state) => state.setCartItemsCount)
  const user = useBoundStore((state) => state.user)
  const router = useRouter()
  const searchInputRef = useRef<HTMLInputElement>(null)

  const accessToken = getAccessTokenFromLocalStorage()

  // Gọi api check xem tài khoản này có shop nào chưa
  useEffect(() => {
    if (!user) return
    
    const checkUserHasShopOrNot = async () => {
      try {
        const response = await checkUserHasShopAPI()
        setShopStatus(response.data.shopStatus)
      } catch {
        // Ignore error
      }
    }
    checkUserHasShopOrNot()
  }, [user])

  // Gọi API đếm số cart items
  useEffect(() => {
    if (!user) {
      setCartItemsCount(0)
      return
    }
    
    // Nếu cartItemsCount = 0 (khởi tạo hoặc user logout), fetch from API
    // Hoặc có thể luôn fetch để đảm bảo đồng bộ
    const fetchCartItemsCount = async () => {
      try {
        const response = await countCartItemsAPI(user.id)
        setCartItemsCount(response.data.count)
      } catch {
        // Ignore error
        setCartItemsCount(0)
      }
    }
    fetchCartItemsCount()
  }, [user, setCartItemsCount])

  const pathname = usePathname()

  // Handle search submit
  const handleSearch = useCallback(() => {
    const trimmedQuery = searchValue.trim()
    if (!trimmedQuery) return

    // Lưu vào history
    addSearchHistory(trimmedQuery)

    // Kiểm tra xem đang ở trang shop không
    const shopPageMatch = pathname?.match(/^\/shop\/([^/]+)/)
    
    if (shopPageMatch) {
      // Nếu đang ở trang shop, giữ nguyên shopId
      const shopId = shopPageMatch[1]
      router.push(`/shop/${shopId}?search=${encodeURIComponent(trimmedQuery)}`)
    } else {
      // Navigate to search page
      router.push(`/search?search=${encodeURIComponent(trimmedQuery)}`)
    }
    
    // Hide dropdown và blur input
    setShowHistory(false)
    searchInputRef.current?.blur()
  }, [searchValue, router, pathname])

  // Handle Enter key
  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearch()
    }
  }, [handleSearch])

  // Handle history item selection
  const handleHistorySelect = useCallback((query: string) => {
    setSearchValue(query)
    setShowHistory(false)
    
    // Navigate to search page
    router.push(`/search?search=${encodeURIComponent(query)}`)
  }, [router])

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const searchContainer = searchInputRef.current?.parentElement?.parentElement
      if (searchContainer && !searchContainer.contains(event.target as Node)) {
        setShowHistory(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])


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
            {user && ['SELLER', 'CUSTOMER'].includes(user.roleName.toUpperCase()) && (
              shopStatus === 'ACTIVE'
                ? (
                  <Link href='/shop/orders' target='_blank' rel='noopener noreferrer' className='hover:text-[#ABD1C6] transition-colors font-semibold'>
                    Kênh Người Bán
                  </Link>
                )
                : shopStatus === 'UNDER_REVIEW' || shopStatus === 'REJECTED'
                  ? (
                    <Link href='/shop-pending' className='hover:text-[#ABD1C6] transition-colors font-semibold'>
                      Đăng kí bán hàng
                    </Link>
                  )
                  : (
                    <Link href='/create-shop' className='hover:text-[#ABD1C6] transition-colors font-semibold'>
                      Đăng kí bán hàng
                    </Link>
                  )
            )}
            
            {user && user.roleName.toUpperCase().includes('ADMIN') && (
              <Link href='/admin/users' target='_blank' rel='noopener noreferrer' className='hover:text-[#ABD1C6] transition-colors font-semibold'>
                Kênh Quản Lý
              </Link>
            )}
          </div>
          <div className='flex items-center gap-2 lg:gap-4'>
            {/* <button className='hover:text-[#ABD1C6] transition-colors flex items-center gap-1.5 font-semibold'>
              <Globe className='w-4 h-4' />
              <span className='text-xs lg:text-sm'>Tiếng Việt</span>
            </button> */}
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
        <div className='w-full max-w-400 px-4 lg:px-6 py-2 lg:py-3'>
          <div className='flex items-center justify-between gap-3 lg:gap-6'>
            {/* Logo */}
            <Link href='/' className='flex items-center gap-2 lg:gap-3 shrink-0 hover:opacity-90 transition-opacity cursor-pointer'>
              <div className='relative w-12 h-12 lg:w-16 lg:h-16'>
                <Image
                  src='/images/logo_4x.png'
                  alt='Szone Logo'
                  fill
                  className='object-contain'
                  priority
                />
              </div>
              <span className='text-white font-bold text-2xl lg:text-3xl tracking-tight select-none'>
                Szone
              </span>
            </Link>

            {/* Search Bar - Desktop */}
            <div className='hidden md:flex flex-1 max-w-4xl mx-4 lg:mx-8 relative'>
              <div className='w-full flex items-stretch bg-white rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow'>
                <input
                  ref={searchInputRef}
                  type='text'
                  placeholder='Tìm kiếm'
                  value={searchValue}
                  onChange={(e) => setSearchValue(e.target.value)}
                  onFocus={() => setShowHistory(true)}
                  onKeyDown={handleKeyDown}
                  className='flex-1 px-5 py-2 lg:py-2.5 text-sm lg:text-base text-gray-700 focus:outline-none placeholder:text-gray-400'
                />
                <button 
                  onClick={handleSearch}
                  className='bg-linear-to-r from-[#FF6B35] to-[#FF5722] hover:from-[#FF5722] hover:to-[#FF4500] text-white px-6 lg:px-8 py-2 lg:py-2.5 flex items-center justify-center transition-all'
                >
                  <Search className='w-5 h-5 lg:w-6 lg:h-6' />
                </button>
              </div>
              <SearchHistoryDropdown 
                isVisible={showHistory}
                onSelect={handleHistorySelect}
              />
            </div>



            {/* Cart */}
            <Link href='/cart' className='relative shrink-0 p-2 hover:bg-white/10 rounded-lg transition-all group'>
              <ShoppingCart className='w-6 h-6 lg:w-7 lg:h-7 text-white group-hover:scale-110 transition-transform' />
              {cartItemsCount > 0 && (
                <span className='absolute -top-1 -right-1 bg-linear-to-r from-red-500 to-red-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold shadow-md'>
                  {cartItemsCount}
                </span>
              )}
            </Link>
          </div>

          {/* Search Bar - Mobile */}
          <div className='md:hidden mt-2'>
            <div className='flex items-stretch bg-white rounded-lg overflow-hidden shadow-md'>
              <input
                type='text'
                placeholder='Tìm kiếm...'
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                onKeyDown={handleKeyDown}
                className='flex-1 px-4 py-2 text-base text-gray-700 focus:outline-none placeholder:text-gray-400'
              />
              <button 
                onClick={handleSearch}
                className='bg-linear-to-r from-[#FF6B35] to-[#FF5722] text-white px-5 py-2 flex items-center justify-center'
              >
                <Search className='w-6 h-6' />
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}