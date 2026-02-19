import http from '~/config/http'
import { ApiResponse } from '~/interface/response.interface'

// ============ TYPES ============

// calculatePrice
export interface CalculatePriceRequest {
  itemsByShop: Record<string, { productId: string; productVariantId: string; quantity: number }[]>
  szoneVoucherId?: string
  shopVouchers?: Record<string, string>
}

export interface CalculatePriceItem {
  id: string
  productId: string
  productVariantId: string
  name: string
  price: number
  quantity: number
  image: string
  sku: string
}

export interface CalculatePriceShop {
  id: string
  name: string
  logo: string
  shopSubtotal: number
  shopShippingFee: number
  shopVoucherDiscount: number
  items: CalculatePriceItem[]
}

export interface CalculatePriceSummary {
  subtotal: number
  shippingFee: number
  shopsVoucherDiscount: number
  szoneVoucherDiscount: number
  finalPrice: number
}

export interface CalculatePriceResponse {
  itemsWithShop: CalculatePriceShop[]
  summary: CalculatePriceSummary
}

// Eligible Vouchers
export interface EligibleVoucherItem {
  productId: string
  productVariantId: string
  quantity: number
  price: number
}

export interface EligibleVoucher {
  id: string
  code: string
  name: string
  discountType: 'FIXED' | 'PERCENT'
  discountValue: number
  minOrderValue: number
  maxDiscountValue: number | null
  startDate: string
  endDate: string
  scope: string
  usageLimit: number
  remainingUsage: number
  userRemainingUsage: number
}

export interface EligibleVouchersResponse {
  vouchers: EligibleVoucher[]
}

// ============ API CALLS ============

export const calculatePriceAPI = async (data: CalculatePriceRequest) => {
  const response = await http.post<ApiResponse<CalculatePriceResponse>>(
    '/api/v1/orders/calculate-price',
    data
  )
  return response
}

export const getEligibleShopVouchersAPI = async (
  shopId: string,
  data: { items: EligibleVoucherItem[] }
) => {
  const response = await http.post<ApiResponse<EligibleVouchersResponse>>(
    `/api/v1/vouchers/shops/${shopId}/eligible`,
    data
  )
  return response
}

export const getEligibleSzoneVouchersAPI = async (
  data: { items: EligibleVoucherItem[] }
) => {
  const response = await http.post<ApiResponse<EligibleVouchersResponse>>(
    '/api/v1/vouchers/platform-vouchers/eligible',
    data
  )
  return response
}
