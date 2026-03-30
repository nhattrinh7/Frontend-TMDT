import http from '~/config/http'
import { ApiResponse } from '~/interface/response.interface'
import { 
  RegisterBodyTypeCallAPI,
  RegisterResType,
  LoginBodyType,
  LoginResType,
  VerifyEmailBodyType,
  RefreshTokenResType,
  ForgotPasswordBodyType,
  ResetPasswordBodyCallAPI,
} from '~/zodSchema/auth.schema'

// REGISTER
export const registerAPI = async (data: RegisterBodyTypeCallAPI) => {
  const response = await http.post<ApiResponse<RegisterResType>>('/api/v1/auth/register', data)
  return response.data
}

// VERIFY EMAIL
export const verifyEmailAPI = async (data: VerifyEmailBodyType) => {
  const response = await http.post<ApiResponse>('/api/v1/auth/verify-email', data)
  return response
}

// REFRESH TOKEN
export const refreshTokenAPI = async (refreshToken: string) => {
  const response = await http.post<ApiResponse<RefreshTokenResType>>('/api/v1/auth/refresh-token',
    { refreshToken },
    { skipInterceptor: true }
  )
  return response.data
}

// LOGIN
export const loginAPI = async (data: LoginBodyType): Promise<ApiResponse<LoginResType>> => {
  const response = await http.post<ApiResponse<LoginResType>>('/api/v1/auth/login', data)
  return response
}

export const loginClientAPI = async (data: LoginBodyType): Promise<ApiResponse<LoginResType>> => {
  const response = await fetch('/api/auth/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  })

  if (!response.ok) {
    const errorData = await response.json()
    throw new Error(errorData.message || 'Login failed')
  }
  const json: ApiResponse<LoginResType> = await response.json()
  return json
}

// FORGOT PASSWORD
export const forgotPasswordAPI = async (data: ForgotPasswordBodyType) => {
  const response = await http.post<ApiResponse>('/api/v1/auth/forgot-password', data)
  return response
}

// RESET PASSWORD
export const resetPasswordAPI = async (data: ResetPasswordBodyCallAPI) => {
  const response = await http.post<ApiResponse>('/api/v1/auth/reset-password', data)
  return response
}

// Logout đến route handler
export const logoutAPI = async (): Promise<{ message: string }> => {
  const response = await http.post<{ message: string }>(
    '/api/auth/logout',
    {},
    { baseUrl: '' }
  )
  return response
}

