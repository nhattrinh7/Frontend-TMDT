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

// ============ PLACE ORDER ============

export interface PlaceOrderRequest {
  itemsByShop: Record<string, { productId: string; productVariantId: string; quantity: number }[]>
  shopVouchers?: Record<string, string>
  szoneVoucherId?: string
  expectedFinalPrice: number
  addressId: string
  paymentMethod: 'COD' | 'WALLET' | 'QRCODE'
}

export interface PlaceOrderResponse {
  success: boolean
  sagaId: string
  message?: string
  paymentMethod?: string
}

export interface ConfirmWalletPaymentRequest {
  sagaId: string
  passcode: string
}

export interface ConfirmWalletPaymentResponse {
  success: boolean
  message?: string
  error?: string
}

export const placeOrderAPI = async (data: PlaceOrderRequest) => {
  const response = await http.post<ApiResponse<PlaceOrderResponse>>(
    '/api/v1/sagas/place-order',
    data
  )
  return response
}

export const confirmWalletPaymentAPI = async (data: ConfirmWalletPaymentRequest) => {
  const response = await http.post<ApiResponse<ConfirmWalletPaymentResponse>>(
    '/api/v1/sagas/confirm-wallet-payment',
    data
  )
  return response
}

// ============ USER ORDERS (Đơn mua) ============

export interface UserOrderItem {
  id: string
  productId: string
  productVariantId: string
  productName: string
  variantImage: string
  sku: string
  quantity: number
  finalPrice: number
}

export interface UserOrder {
  id: string
  shopId: string
  shopName: string
  status: string
  paymentMethod: string
  finalPrice: number
  createdAt: string
  orderItems: UserOrderItem[]
}

export interface CursorMeta {
  nextCursor: string | null
  hasMore: boolean
  limit: number
}

export const getUserOrdersPaginatedAPI = async (
  userId: string,
  params: { status: string; cursor?: string; limit?: number }
) => {
  const searchParams = new URLSearchParams()
  searchParams.set('status', params.status)
  if (params.cursor) searchParams.set('cursor', params.cursor)
  if (params.limit) searchParams.set('limit', String(params.limit))

  const response = await http.get<ApiResponse<UserOrder[]> & { meta: CursorMeta }>(
    `/api/v1/orders/users/${userId}?${searchParams.toString()}`
  )
  return response
}

export const cancelOrderAPI = async (orderId: string) => {
  const response = await http.patch<ApiResponse<{ message: string }>>(
    `/api/v1/orders/${orderId}/cancel`,
    {}
  )
  return response
}
