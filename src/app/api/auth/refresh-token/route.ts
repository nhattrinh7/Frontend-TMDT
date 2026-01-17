import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { refreshTokenAPI } from '~/apiRequests/auth.apiRequest'
import jwt from 'jsonwebtoken'

export async function POST(request: Request) {
  const cookieStore = await cookies()
  const body = await request.json()
  const refreshToken = body.refreshToken || cookieStore.get('refreshToken')?.value
  
  if (!refreshToken) {
    return NextResponse.json(
      { message: 'Không tìm thấy refresh token' },
      { status: 401 }
    )
  }

  try {
    // Gọi API refresh token đến Backend - SKIP INTERCEPTOR
    const payload = await refreshTokenAPI(refreshToken)
    const { accessToken: newAccessToken, refreshToken: newRefreshToken } = payload

    const decodedAccessToken = jwt.decode(newAccessToken) as { exp: number }
    const decodedRefreshToken = jwt.decode(newRefreshToken) as { exp: number }

    // Set cookies mới
    cookieStore.set('accessToken', newAccessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      expires: decodedAccessToken.exp * 1000
    })
    
    cookieStore.set('refreshToken', newRefreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      expires: decodedRefreshToken.exp * 1000
    })

    return NextResponse.json({
      accessToken: newAccessToken,
      refreshToken: newRefreshToken
    })
  } catch (error) {
    // Refresh thất bại -> xóa cookies
    cookieStore.delete('accessToken')
    cookieStore.delete('refreshToken')
    
    return NextResponse.json(
      { message: 'Refresh token không hợp lệ hoặc hết hạn' },
      { status: 401 }
    )
  }
}