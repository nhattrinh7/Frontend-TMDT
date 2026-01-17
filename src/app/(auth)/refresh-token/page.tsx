/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { Suspense, useEffect } from 'react'
import { getRefreshTokenFromLocalStorage } from '~/lib/utils'

function RefreshToken() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const refreshToken = getRefreshTokenFromLocalStorage()
  const redirectPathname = searchParams.get('redirect')
  useEffect(() => {
    if (refreshToken) {
      const response = fetch('/api/auth/refresh-token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ refreshToken })
      }) as any

      if (response.accessToken) {
        localStorage.set('accessToken', response.accessToken)
        localStorage.set('refreshToken', response.refreshToken)
        router.push(redirectPathname || '/')
      }       
    } else {
      router.push('/')
    }
  }, [router, redirectPathname, refreshToken])
  return <div>Refresh token....</div>
}

export default function RefreshTokenPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <RefreshToken />
    </Suspense>
  )
}
