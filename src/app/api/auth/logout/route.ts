import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import http from '~/config/http'

export async function POST(request: Request) {
  const cookieStore = await cookies()
  const accessToken = cookieStore.get('accessToken')?.value
  
  // Xóa cookies ngay lập tức
  cookieStore.delete('accessToken')
  cookieStore.delete('refreshToken')

  // Gọi API logout đến Backend (nếu có tokens)
  if (accessToken) {
    try {
      await http.post(
        'api/v1/auth/logout',
        {},
        {
          skipInterceptor: true, // Skip interceptor
          headers: {
            Authorization: `Bearer ${accessToken}`
          }
        }
      )
    } catch (error) {
      // Ignore errors - logout luôn thành công ở client
    }
  }

  return NextResponse.json({ message: 'Đăng xuất thành công' })
}