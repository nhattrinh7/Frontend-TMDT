import { z } from 'zod'

const VoucherScope = z.enum(['ALL', 'CATEGORY', 'PRODUCT'])
const DiscountType = z.enum(['FIXED', 'PERCENT'])

export const VoucherSchema = z.object({
  id: z.uuid(),
  shopId: z.uuid().nullable(),
  code: z.string().min(3).max(20),
  name: z.string().min(3).max(100),
  description: z.string().max(500),
  discountType: DiscountType,
  discountValue: z.number().positive(),
  startDate: z.string(),
  endDate: z.string(),
  usageLimit: z.number().positive(),
  perUserLimit: z.number().positive(),
  scope: VoucherScope,
  usedCount: z.number().default(0),
  isDeleted: z.boolean(),
  deletedBy: z.string().nullable(),
  deletedAt: z.string().nullable(),
  createdAt: z.string(),  
  updatedAt: z.string(),
})
export type Voucher = z.infer<typeof VoucherSchema>

export const createShopVoucherBodyType = z.object({
  shopId: z.string(),
  code: z.string().min(3).max(20),
  name: z.string().min(3).max(100),
  description: z.string().max(500),
  discountType: DiscountType,
  discountValue: z.number().positive(),
  startDate: z.string(),
  endDate: z.string(),
  usageLimit: z.number().positive(),
  perUserLimit: z.number().positive(),
  scope: VoucherScope,
  selectedProducts: z.array(z.string()).optional(),
})
export type CreateVoucherBodyType = z.infer<typeof createShopVoucherBodyType>
