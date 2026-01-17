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
