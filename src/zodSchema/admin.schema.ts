import { z } from 'zod'
import { userSchema } from './auth.schema'

// ========== Admin Users Management ==========

// Pagination metadata
export const AdminPaginationMetaSchema = z.object({
  total: z.number().int().min(0),
  page: z.number().int().positive(),
  limit: z.number().int().positive(),
  totalPages: z.number().int().min(0),
})
export type AdminPaginationMeta = z.infer<typeof AdminPaginationMetaSchema>

// Response từ API getUsersPaginated
export const UsersPaginatedResponseSchema = z.object({
  users: z.array(userSchema),
  meta: AdminPaginationMetaSchema,
})
export type UsersPaginatedResponse = z.infer<typeof UsersPaginatedResponseSchema>

// Params cho API getUsersPaginated
export type GetUsersPaginatedParams = {
  page?: number
  limit?: number
  search?: string
  status: 'ACTIVE' | 'BANNED'
}

// ========== Admin Brands Management ==========

// Brand schema
export const BrandSchema = z.object({
  id: z.uuid(),
  name: z.string(),
  description: z.string(),
  logo: z.url(),
  country: z.string(),
  createdAt: z.string(),
  updatedAt: z.string(),
})
export type Brand = z.infer<typeof BrandSchema>

// Response từ API getBrandsPaginated
export const BrandsPaginatedResponseSchema = z.object({
  brands: z.array(BrandSchema),
  meta: AdminPaginationMetaSchema,
})
export type BrandsPaginatedResponse = z.infer<typeof BrandsPaginatedResponseSchema>

// Params cho API getBrandsPaginated
export type GetBrandsPaginatedParams = {
  page?: number
  limit?: number
  search?: string
}

// Schema cho form tạo/cập nhật brand
export const BrandFormSchema = z.object({
  name: z.string().min(1, 'Tên thương hiệu không được để trống'),
  description: z.string().min(1, 'Mô tả không được để trống'),
  logo: z.url('URL logo không hợp lệ'),
  country: z.string().min(1, 'Quốc gia không được để trống'),
})
export type BrandFormInput = z.infer<typeof BrandFormSchema>

// ========== Admin Shops Management ==========

// Address schema (nested in shop)
export const ShopAddressSchema = z.object({
  id: z.string(),
  userId: z.string(),
  recipientName: z.string(),
  recipientPhoneNumber: z.string(),
  province: z.string(),
  ward: z.string(),
  detail: z.string(),
  isDefault: z.boolean(),
  createdAt: z.string(),
  updatedAt: z.string(),
})
export type ShopAddress = z.infer<typeof ShopAddressSchema>

// Shop owner schema (nested in shop)
export const ShopOwnerSchema = z.object({
  id: z.string(),
  username: z.string(),
  email: z.string(),
  roleId: z.string(),
  fullName: z.string(),
  phoneNumber: z.string(),
  dob: z.string(),
  gender: z.enum(['MALE', 'FEMALE', 'OTHER']),
  avatar: z.string().nullable(),
  status: z.enum(['ACTIVE', 'BANNED']),
  require2FA: z.boolean(),
  emailVerified: z.boolean(),
  createdAt: z.string(),
  updatedAt: z.string(),
})
export type ShopOwner = z.infer<typeof ShopOwnerSchema>

// Admin shop schema (full shop info with owner and address)
export const AdminShopSchema = z.object({
  id: z.string(),
  ownerId: z.string(),
  name: z.string(),
  description: z.string(),
  logo: z.string().nullable(),
  addressId: z.string(),
  ratingAvg: z.number(),
  ratingCount: z.number(),
  status: z.enum(['UNDER_REVIEW', 'ACTIVE', 'CLOSED', 'BANNED', 'REJECTED']),
  totalRevenue: z.number(),
  revenueInMonth: z.number(),
  totalOrderCount: z.number(),
  orderCountInMonth: z.number(),
  bankName: z.string(),
  bankNumber: z.string(),
  taxCode: z.string(),
  categoryId: z.string(),
  isJoinSaleCampaign: z.boolean(),
  verifiedAt: z.string().nullable(),
  rejectReason: z.string().nullable(),
  createdAt: z.string(),
  updatedAt: z.string(),
  owner: ShopOwnerSchema,
  address: ShopAddressSchema,
})
export type AdminShop = z.infer<typeof AdminShopSchema>

// Response từ API getShopsPaginated
export const ShopsPaginatedResponseSchema = z.object({
  shops: z.array(AdminShopSchema),
  meta: AdminPaginationMetaSchema,
})
export type ShopsPaginatedResponse = z.infer<typeof ShopsPaginatedResponseSchema>

// Params cho API getShopsPaginated
export type GetShopsPaginatedParams = {
  page?: number
  limit?: number
  status: 'UNDER_REVIEW' | 'ACTIVE' | 'CLOSED' | 'BANNED' | 'REJECTED'
  search?: string
  categoryIds: string[]
}
