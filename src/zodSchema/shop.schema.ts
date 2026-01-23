import { z } from 'zod'

export const ShopStatusEnum = z.enum([
  'UNDER_REVIEW', 
  'ACTIVE', 
  'CLOSED',
  'BANNED',
])

export const BankEnum = z.enum([
  'VIETCOMBANK', 
  'BIDV', 
  'VIETINBANK',
  'AGRIBANK',
  'VPBANK',
  'TECHCOMBANK',
  'MB',
  'SACOMBANK',
  'ACB',
  'HDBANK',
  'TPBANK',
  'SHB',
  'VIB',
])

export const CategoryEnum = z.enum([
  'FASHION', 
  'FASHION_ACCESSORIES', 
  'BAGS_WALLETS',
  'WATCHES',
  'FOOTWEAR',
  'BEAUTY',
  'HEALTH',
  'MOTHER_BABY',
  'PHONES',
  'AUDIO_DEVICES',
  'CAMERAS_FLYCAM',
  'HOME_APPLIANCES',
  'HOME_LIVING',
  'STATIONERY',
  'SPORTS_OUTDOOR',
  'FOOD_BEVERAGE',
])

const ShopStatus = z.enum(['UNDER_REVIEW', 'ACTIVE', 'CLOSED', 'BANNED'])
const Bank = z.enum([
  'VIETCOMBANK', 
  'BIDV', 
  'VIETINBANK', 
  'AGRIBANK', 
  'VPBANK', 
  'TECHCOMBANK', 
  'MB', 
  'SACOMBANK', 
  'ACB', 
  'HDBANK', 
  'TPBANK', 
  'SHB', 
  'VIB'
])
const Category = z.enum([
  'FASHION', 
  'FASHION_ACCESSORIES', 
  'BAGS_WALLETS', 
  'WATCHES', 
  'FOOTWEAR', 
  'BEAUTY', 
  'HEALTH', 
  'MOTHER_BABY', 
  'PHONES', 
  'AUDIO_DEVICES', 
  'CAMERAS_FLYCAM', 
  'HOME_APPLIANCES', 
  'HOME_LIVING', 
  'STATIONERY', 
  'SPORTS_OUTDOOR', 
  'FOOD_BEVERAGE'
])

export const ShopSchema = z.object({
  id: z.uuid(),
  ownerId: z.uuid(),
  name: z.string(),
  description: z.string(),
  logo: z.string().nullable(),
  addressId: z.uuid(),
  ratingAvg: z.number(),
  ratingCount: z.number(),
  status: ShopStatus,
  bankName: Bank,
  bankNumber: z.string().min(6),
  totalRevenue: z.number(),
  revenueInMonth: z.number(),
  totalOrderCount: z.number(),
  orderCountInMonth: z.number(),
  taxCode: z.string().min(10),
  category: Category,
  isJoinSaleCampaign: z.boolean(),
  verifiedAt: z.date().nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
})
export type Shop = z.infer<typeof ShopSchema>

export const createShopBodyType = z.object({
  name: z.string(),
  description: z.string(),
  categoryId: z.string(),
  bankName: z.string(),
  bankNumber: z.string(),
  taxCode: z.string(),
})
export type CreateShopBodyType = z.infer<typeof createShopBodyType>

export const updateShopBodyType = z.object({
  name: z.string(),
  description: z.string(),
  addressId: z.string(),
  bankName: z.string(),
  bankNumber: z.string(),
  taxCode: z.string(),
})
export type UpdateShopBodyType = z.infer<typeof updateShopBodyType>