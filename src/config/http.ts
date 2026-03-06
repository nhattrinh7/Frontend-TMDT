/* eslint-disable @typescript-eslint/no-explicit-any */
import env from '~/config/env.config'
import { normalizePath } from '~/lib/utils'
import { LoginResType } from '~/zodSchema/auth.schema'
import { redirect } from 'next/navigation'

type CustomOptions = Omit<RequestInit, 'method'> & {
  baseUrl?: string | undefined
  skipInterceptor?: boolean // Flag để skip interceptor
}

interface IHttpErrorPayload {
  statusCode: number
  message: string
  timestamp: string
  path: string
}

interface IValidationErrorPayload extends IHttpErrorPayload {
  errors: []
}

class HttpError extends Error {
  statusCode: number
  timestamp: string
  path: string

  constructor(data: { statusCode: number, message: string, timestamp: string, path: string }) {
    super(data.message)
    this.statusCode = data.statusCode
    this.timestamp = data.timestamp
    this.path = data.path
    this.name = 'HttpError'
  }
}

class ValidationError extends HttpError {
  errors: []

  constructor(data: IValidationErrorPayload) {
    super(data)     
    this.errors = data.errors
    this.name = 'ValidationError' 
  }
}

// Lưu promise của logout request để tránh gọi logout nhiều lần đồng thời 
let clientLogoutRequest: null | Promise<any> = null
// Lưu promise của refresh request để tránh gọi refresh nhiều lần đồng thời
let clientRefreshRequest: null | Promise<any> = null
const isClient = typeof window !== 'undefined'

const request = async <Response>(
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE',
  url: string,
  options?: CustomOptions | undefined
) => {
  let body: FormData | string | undefined = undefined

  // Nếu body là FormData thì lấy thằng, ko biến đổi
  if (options?.body instanceof FormData) {
    body = options.body
  } else if (options?.body) {
    body = JSON.stringify(options.body)
  }

  // body là FormData thì không tự set Content-Type (browser tự động set với boundary)
  const baseHeaders: { [key: string]: string } = 
    body instanceof FormData
      ? {}
      : { 'Content-Type': 'application/json' }
        
  // Gọi API từ Browser thì tự động thêm Authorization header
  if (isClient) {
    const accessToken = localStorage.getItem('accessToken')
    if (accessToken) {
      baseHeaders.Authorization = `Bearer ${accessToken}`
    }
  }
  
  // Truyền baseUrl = '' hoặc ko truyền
  // Ứng với baseUrl = '' hoặc baseUrl = undefined
  // baseUrl = '' thì gọi đến Next server, baseUrl = undefined thì gọi đến Backend
  const baseUrl =
    options?.baseUrl === undefined
      ? env.NEXT_PUBLIC_API_ENDPOINT
      : options.baseUrl

  const fullUrl = `${baseUrl}/${normalizePath(url)}`

  const res = await fetch(fullUrl, {
    ...options,
    headers: {
      ...baseHeaders,
      ...options?.headers
    } as any,
    body,
    method
  })
  const payload: Response = await res.json()


  // Nếu skipInterceptor = true, chỉ throw error và return, không xử lý logic đặc biệt
  if (options?.skipInterceptor) {
    if (!res.ok) {
      if (res.status === 422) {
        throw new ValidationError(payload as IValidationErrorPayload)
      } else {
        throw new HttpError(payload as IHttpErrorPayload)
      }
    }
    return payload
  }

  // Interceptor là nơi chúng ta xử lý request và response trước khi trả về cho phía component
  if (!res.ok) {
    if (res.status === 422) {
      throw new ValidationError(payload as IValidationErrorPayload) 
    }
    // 410: Access token hết hạn - cần refresh token
    else if (res.status === 410) {
      if (isClient) {
        // CLIENT-SIDE: Refresh token
        if (!clientRefreshRequest) {
          const refreshToken = localStorage.getItem('refreshToken')
          
          if (!refreshToken) return handleClientLogout()

          // Gọi Next.js API route để refresh token
          // API route này sẽ xử lý việc gọi BE và set cookies
          clientRefreshRequest = fetch('/api/auth/refresh-token', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({ refreshToken })
          })
          
          try {
            const refreshRes = await clientRefreshRequest
            
            if (refreshRes.ok) {
              const refreshData = await refreshRes.json()
              const { accessToken: newAccessToken, refreshToken: newRefreshToken } = refreshData
              
              // Lưu tokens mới
              localStorage.setItem('accessToken', newAccessToken)
              localStorage.setItem('refreshToken', newRefreshToken)
              
              // Retry request ban đầu với token mới
              clientRefreshRequest = null
              return request<Response>(method, url, options)
            } else {
              // Refresh token thất bại -> logout
              return handleClientLogout()
            }
          } catch (error) {
            // Lỗi khi refresh -> logout
            return handleClientLogout()
          } finally {
            clientRefreshRequest = null
          }
        } else {
          // Đang có refresh request khác -> đợi nó xong rồi retry
          await clientRefreshRequest
          return request<Response>(method, url, options)
        }
      } else {
        // SERVER-SIDE
        redirect('/refresh-token')
      }
    }
    // 401: Token không hợp lệ hoặc không có - logout hoàn toàn
    else if (res.status === 401) {
      if (isClient) {
        return handleClientLogout()
      } else {
        redirect('/logout')
      }
    } 
    else {
      throw new HttpError(payload as IHttpErrorPayload)
    }
  }
  
  return payload
}

// Helper function để xử lý logout ở client
const handleClientLogout = async () => {
  if (!clientLogoutRequest) {
    clientLogoutRequest = fetch('/api/v1/auth/logout', {
      method: 'POST',
      body: null,
      headers: {
        'Content-Type': 'application/json'
      }
    })
    
    try {
      await clientLogoutRequest
    } catch (error) {
      // Ignore errors - logout luôn thành công
    } finally {
      localStorage.removeItem('accessToken')
      localStorage.removeItem('refreshToken')
      localStorage.removeItem('bound-store') // Clear zustand persist store (user & shop)
      clientLogoutRequest = null
      location.href = '/login'
    }
  }
  
  // Throw error để stop execution
  throw new Error('Unauthorized - redirecting to login')
}

const http = {
  get<Response>(
    url: string,
    options?: Omit<CustomOptions, 'body'> | undefined
  ) {
    return request<Response>('GET', url, options)
  },
  post<Response>(
    url: string,
    body?: any,
    options?: Omit<CustomOptions, 'body'> | undefined
  ) {
    return request<Response>('POST', url, { ...options, body })
  },
  put<Response>(
    url: string,
    body: any,
    options?: Omit<CustomOptions, 'body'> | undefined
  ) {
    return request<Response>('PUT', url, { ...options, body })
  },
  patch<Response>(
    url: string,
    body?: any,
    options?: Omit<CustomOptions, 'body'> | undefined
  ) {
    return request<Response>('PATCH', url, { ...options, body })
  },
  delete<Response>(
    url: string,
    options?: Omit<CustomOptions, 'body'> | undefined
  ) {
    return request<Response>('DELETE', url, { ...options })
  }
}

export default http