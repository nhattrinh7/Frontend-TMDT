// app/logout/LogoutClient.tsx
'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useBoundStore } from '~/zustand/store'

export default function LogoutClient() {
  const router = useRouter()
  const clearUser = useBoundStore((state) => state.clearUser)
  const clearShop = useBoundStore((state) => state.clearShop)
  
  useEffect(() => {
    // Clear localStorage (Client-side)
    localStorage.removeItem('accessToken')
    localStorage.removeItem('refreshToken')
    
    // Clear Zustand store
    clearUser()
    clearShop()
    
    // Redirect to login
    router.push('/login')
  }, [router, clearUser, clearShop])
  
  return (
    <div className="flex items-center justify-center min-h-screen">
      <p>Đang đăng xuất...</p>
    </div>
  )
}