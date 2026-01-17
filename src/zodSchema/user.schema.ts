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