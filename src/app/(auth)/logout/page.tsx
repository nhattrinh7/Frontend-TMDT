import { cookies } from 'next/headers'
import LogoutClient from '~/app/(auth)/logout/LogoutClient'
import http from '~/config/http'

export default async function LogoutPage() {
  const cookieStore = await cookies()
  const accessToken = cookieStore.get('accessToken')?.value
  
  // Xóa cookies
  cookieStore.delete('accessToken')
  cookieStore.delete('refreshToken')
  
  // Gọi API logout đến Backend (nếu có tokens)
  if (accessToken) {
    try {
      await http.post(
        'api/v1/auth/logout',
        {},
        {
          skipInterceptor: true,
          headers: {
            Authorization: `Bearer ${accessToken}`
          }
        }
      )
    } catch (error) {
      // Ignore errors
    }
  }
  
  return <LogoutClient />
}