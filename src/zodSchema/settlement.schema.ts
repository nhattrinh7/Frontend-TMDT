import { z } from 'zod'

export const SettlementStatusEnum = z.enum(['PENDING', 'COMPLETED'])
export const SettlementPaymentMethodEnum = z.enum(['WALLET'])

export const SettlementSchema = z.object({
  orderId: z.string(),
  goodsPrice: z.number(),
  commissionFee: z.number(),
  payout: z.number(),
  paymentMethod: SettlementPaymentMethodEnum,
  status: SettlementStatusEnum,
  payoutAt: z.string().nullable(),
  createdAt: z.string(),
})

export type Settlement = z.infer<typeof SettlementSchema>
