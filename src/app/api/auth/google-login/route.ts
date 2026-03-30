/* eslint-disable @typescript-eslint/no-explicit-any */
import { cookies } from 'next/headers'
import { googleLoginAPI } from '~/apiRequests/auth.apiRequest'
import { GoogleLoginBodyType } from '~/zodSchema/auth.schema'
import jwt from 'jsonwebtoken'

export async function POST(request: Request) {
  const body = await request.json() as GoogleLoginBodyType
  const cookieStore = await cookies()

  try {
    const payload = await googleLoginAPI(body)
    const accessToken = payload.data.accessToken
    const refreshToken = payload.data.refreshToken

    const decodedAccessToken = jwt.decode(accessToken) as { exp: number }
    const decodedRefreshToken = jwt.decode(refreshToken) as { exp: number }

    cookieStore.set('accessToken', accessToken, {
      path: '/',
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      expires: new Date(decodedAccessToken.exp * 1000) 
    })

    cookieStore.set('refreshToken', refreshToken, {
      path: '/',
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      expires: new Date(decodedRefreshToken.exp * 1000)
    })

    return Response.json(payload)
  } catch (error: any) {
    console.error('Google login error:', error)
    return Response.json({ 
      message: 'Unexpected error when login with Google from Next server',
      error: error.message 
    }, { status: 500 })
  }
}
