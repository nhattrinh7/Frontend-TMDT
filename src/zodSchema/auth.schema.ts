import { z } from 'zod'

const GenderEnum = z.enum(['MALE', 'FEMALE', 'OTHER'])
const StatusEnum = z.enum(['ACTIVE', 'BANNED'])

export const userSchema = z.object({
  id: z.string(),
  username: z.string(),
  email: z.email(),        
  roleId: z.string(),
  roleName: z.string(),
  fullName: z.string(),
  phoneNumber: z.string(),
  dob: z.string(),
  gender: GenderEnum,
  avatar: z.string().nullable(),
  status: StatusEnum,
  emailVerified: z.boolean(),
  require2FA: z.boolean(),
  permissions: z.array(z.string()),
  createdAt: z.string(),
  updatedAt: z.string(),
})
export type User = z.infer<typeof userSchema>

// Register
export type RegisterResType = z.infer<typeof userSchema>

export const registerBodyFormSchema = z.object({
  name: z.string().min(1, 'Vui lòng nhập họ và tên'),
  email: z.email('Email không hợp lệ'),
  phoneNumber: z.string().min(1, 'Vui lòng nhập số điện thoại'),
  day: z.string().min(1, 'Vui lòng chọn ngày'),
  month: z.string().min(1, 'Vui lòng chọn tháng'),
  year: z.string().regex(/^\d{4}$/, 'Năm sinh phải là 4 chữ số'),
  gender: z.enum(['MALE', 'FEMALE', 'OTHER'], {
    message: 'Vui lòng chọn giới tính',
  }),
  password: z.string().min(8, 'Mật khẩu phải có ít nhất 8 ký tự'),
  confirmPassword: z.string(),
})
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Mật khẩu không khớp',
    path: ['confirmPassword'],
  })
export type RegisterBodyTypeForm = z.infer<typeof registerBodyFormSchema>

export const registerBodyCallApiSchema = z.object({
  fullName: z.string(),
  email: z.email(),
  phoneNumber: z.string(),
  dob: z.string(),
  gender: GenderEnum,
  password: z.string()
})
export type RegisterBodyTypeCallAPI = z.infer<typeof registerBodyCallApiSchema>


// Login
export const loginBodySchema = z.object({
  email: z.email('Email không hợp lệ'),
  password: z.string().min(8, 'Mật khẩu phải có ít nhất 8 ký tự'),
})
export type LoginBodyType = z.infer<typeof loginBodySchema>

export const loginResSchema = z.object({
  accessToken: z.string(),
  refreshToken: z.string(),
  user: userSchema,
})
export type LoginResType = z.infer<typeof loginResSchema>

// Google login
export const googleLoginBodySchema = z.object({
  credential: z.string().min(1, 'Credential is required'),
})
export type GoogleLoginBodyType = z.infer<typeof googleLoginBodySchema>


// Verify email
export const verifyEmailSchema = z.object({
  email: z.email(),
  otp: z.string().length(6, 'OTP must be exactly 6 digits').regex(/^\d+$/, 'OTP must contain only numbers'),
})
export type VerifyEmailBodyType = z.infer<typeof verifyEmailSchema>


// Refresh Token
export const refreshTokenSchema = z.object({
  accessToken: z.string(),
  refreshToken: z.string(),
})
export type RefreshTokenResType = z.infer<typeof refreshTokenSchema>


// Forgot password
export const forgotPasswordBodySchema = z.object({
  email: z.email('Email không hợp lệ'),
})
export type ForgotPasswordBodyType = z.infer<typeof forgotPasswordBodySchema>


// Reset password
export const resetPasswordBodySchema = z.object({
  otp: z
    .string()
    .length(6, 'OTP phải đủ 6 số')
    .regex(/^\d+$/, 'OTP chỉ gồm số'),
  newPassword: z.string().min(8, 'Mật khẩu mới phải có ít nhất 8 ký tự'),
})
export type ResetPasswordBodyType = z.infer<typeof resetPasswordBodySchema>
export type ResetPasswordBodyCallAPI = ResetPasswordBodyType & { email: string }


