import { z } from 'zod'
import { userSchema } from '~/zodSchema/auth.schema'

const GenderEnum = z.enum(['MALE', 'FEMALE', 'OTHER'])
const StatusEnum = z.enum(['ACTIVE', 'BANNED'])

// Update profile
export const updateProfileBodySchema = z.object({
  username: z.string(),
  fullName: z.string(),
  phoneNumber: z.string(),
  dob: z.string(),
  gender: GenderEnum,
})
export type UpdateProfileBodyType = z.infer<typeof updateProfileBodySchema>

export type UploadProfileResType = z.infer<typeof userSchema>
export type GetProfileResType = z.infer<typeof userSchema>

// Address
export const getAddressBodySchema = z.object({
  id: z.uuid(),
  userId: z.uuid(),
  recipientName: z.string(),
  recipientPhoneNumber: z.string(),
  province: z.string(),
  ward: z.string(),
  detail: z.string(),
  isDefault: z.boolean(),
  createdAt: z.date(),
  updatedAt: z.date(),
})
export type GetAddressResType = z.infer<typeof getAddressBodySchema>
export type AddAddressResType = z.infer<typeof getAddressBodySchema>
export type DeleteAddressResType = z.infer<typeof getAddressBodySchema>
export type UpdateAddressResType = z.infer<typeof getAddressBodySchema>

export const updateAddressBodyType = z.object({
  recipientName: z.string(),
  recipientPhoneNumber: z.string(),
  province: z.string(),
  ward: z.string(),
  detail: z.string(),
  isDefault: z.boolean(),
})
export type UpdateAddressBodyType = z.infer<typeof updateAddressBodyType>

export const changePasswordBodyType = z.object({
  currentPassword: z.string(),
  newPassword: z.string(),
})
export type ChangePasswordBodyType = z.infer<typeof changePasswordBodyType>

// Count Cart Items
export const countCartItemsResSchema = z.object({
  count: z.number(),
})
export type CountCartItemsResType = z.infer<typeof countCartItemsResSchema>

// Get Cart
export const cartItemInfoSchema = z.object({
  id: z.string(),
  productId: z.string(),
  productVariantId: z.string(),
  name: z.string(),
  price: z.number(),
  quantity: z.number(),
  image: z.string().nullable(),
  sku: z.string().nullable(),
})
export type CartItemInfoType = z.infer<typeof cartItemInfoSchema>

export const cartGroupedByShopSchema = z.object({
  id: z.string(),
  name: z.string(),
  logo: z.string().nullable(),
  items: z.array(cartItemInfoSchema),
})
export type CartGroupedByShopType = z.infer<typeof cartGroupedByShopSchema>

export const getCartResSchema = z.array(cartGroupedByShopSchema)
export type GetCartResType = z.infer<typeof getCartResSchema>

// Check Cart To Add
export const checkCartToAddBodySchema = z.object({
  productVariantId: z.string(),
  quantity: z.number(),
})
export type CheckCartToAddBodyType = z.infer<typeof checkCartToAddBodySchema>

// Response có thể là 1 trong 2 dạng
export const checkCartToAddQuantityResSchema = z.object({
  productVariantId: z.string(),
  quantity: z.number(),
})

export const checkCartToAddShopResSchema = cartGroupedByShopSchema

export type CheckCartToAddResType = z.infer<typeof checkCartToAddQuantityResSchema> | z.infer<typeof checkCartToAddShopResSchema>

// ===== PASSCODE =====
export const createPassCodeBodySchema = z.object({
  passCode: z.string().length(6, 'Passcode phải có 6 chữ số').regex(/^\d{6}$/, 'Passcode phải là 6 chữ số'),
  confirmPassCode: z.string().length(6, 'Vui lòng xác nhận passcode'),
}).refine((data) => data.passCode === data.confirmPassCode, {
  message: 'Passcode xác nhận không khớp',
  path: ['confirmPassCode'],
})
export type CreatePassCodeBodyType = z.infer<typeof createPassCodeBodySchema>

export const changePassCodeBodySchema = z.object({
  currentPassCode: z.string().length(6, 'Passcode phải có 6 chữ số').regex(/^\d{6}$/, 'Passcode phải là 6 chữ số'),
  newPassCode: z.string().length(6, 'Passcode phải có 6 chữ số').regex(/^\d{6}$/, 'Passcode phải là 6 chữ số'),
  confirmPassCode: z.string().length(6, 'Vui lòng xác nhận passcode'),
}).refine((data) => data.newPassCode === data.confirmPassCode, {
  message: 'Passcode xác nhận không khớp',
  path: ['confirmPassCode'],
})
export type ChangePassCodeBodyType = z.infer<typeof changePassCodeBodySchema>

export const resetPassCodeBodySchema = z.object({
  otp: z.string().length(6, 'OTP phải có 6 ký tự'),
  newPassCode: z.string().length(6, 'Passcode phải có 6 chữ số').regex(/^\d{6}$/, 'Passcode phải là 6 chữ số'),
  confirmPassCode: z.string().length(6, 'Vui lòng xác nhận passcode'),
}).refine((data) => data.newPassCode === data.confirmPassCode, {
  message: 'Passcode xác nhận không khớp',
  path: ['confirmPassCode'],
})
export type ResetPassCodeBodyType = z.infer<typeof resetPassCodeBodySchema>

