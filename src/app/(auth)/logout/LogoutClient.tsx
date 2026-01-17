// app/logout/LogoutClient.tsx
'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function LogoutClient() {
  const router = useRouter()
  
  useEffect(() => {
    // Clear localStorage (Client-side)
    localStorage.removeItem('accessToken')
    localStorage.removeItem('refreshToken')
    
    // Redirect to login
    router.push('/login')
  }, [router])
  
  return (
    <div className="flex items-center justify-center min-h-screen">
      <p>Đang đăng xuất...</p>
    </div>
  )
}