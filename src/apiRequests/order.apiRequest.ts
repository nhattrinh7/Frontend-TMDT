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
  goodsPrice: number
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



export interface UserOrderItem {
  id: string
  productId: string
  productVariantId: string
  productName: string
  variantImage: string
  sku: string
  quantity: number
  finalPrice: number
  isReviewed?: boolean
  returnReason?: string | null
  returnStatus?: 'NONE' | 'REFUNDED'
  returnRequestedAt?: string | null
  returnResolvedAt?: string | null
}

export interface UserOrder {
  id: string
  shopId: string
  shopName: string
  status: string
  paymentMethod: string
  goodsPrice: number
  finalPrice: number
  createdAt: string
  cancelReason?: string | null
  orderItems: UserOrderItem[]
}
export interface CursorMeta {
  nextCursor: string | null
  hasMore: boolean
  limit: number
}

export const getUserOrdersPaginatedAPI = async (
  userId: string,
  params: { status: string; returnStatus?: string; cursor?: string; limit?: number }
) => {
  const searchParams = new URLSearchParams()
  searchParams.set('status', params.status)
  if (params.returnStatus) searchParams.set('returnStatus', params.returnStatus)
  if (params.cursor) searchParams.set('cursor', params.cursor)
  if (params.limit) searchParams.set('limit', String(params.limit))

  const response = await http.get<ApiResponse<UserOrder[]> & { meta: CursorMeta }>(
    `/api/v1/orders/users/${userId}?${searchParams.toString()}`
  )
  return response
}

export const cancelOrderAPI = async (orderId: string, reason?: string) => {
  const response = await http.patch<ApiResponse<{ message: string }>>(
    `/api/v1/orders/${orderId}/cancel`,
    { cancelReason: reason }
  )
  return response
}

// ============ SHOP ORDERS (Quản lý đơn hàng) ============

export interface ShopOrderItem {
  id: string
  productId: string
  productVariantId: string
  productName: string
  variantImage: string
  sku: string
  quantity: number
  finalPrice: number
  returnReason?: string | null
  returnStatus?: 'NONE' | 'REFUNDED'
  returnRequestedAt?: string | null
  returnResolvedAt?: string | null
}

export interface ShopOrder {
  id: string
  shopId: string
  shopName: string
  buyerUsername: string
  buyerAvatar: string | null
  status: string
  paymentMethod: string
  goodsPrice: number
  finalPrice: string | number
  shippingAddress: string
  receiverName: string
  receiverPhoneNumber: string
  subtotal: number
  shippingFee: number
  szoneVoucherDiscount: number
  shopVoucherDiscount: number
  cancelReason?: string | null
  createdAt: string
  orderItems: ShopOrderItem[]
}

export interface OffsetMeta {
  page: number
  limit: number
  totalPages: number
  totalItems: number
}

export const getShopOrdersPaginatedAPI = async (
  shopId: string,
  params: { status: string; page?: number; limit?: number; search?: string; returnStatus?: string }
) => {
  const searchParams = new URLSearchParams()
  searchParams.set('status', params.status)
  if (params.returnStatus) searchParams.set('returnStatus', params.returnStatus)
  if (params.page) searchParams.set('page', String(params.page))
  if (params.limit) searchParams.set('limit', String(params.limit))
  if (params.search) searchParams.set('search', params.search)

  const response = await http.get<
    ApiResponse<{ items: ShopOrder[]; meta: OffsetMeta }>
  >(`/api/v1/orders/shop/${shopId}?${searchParams.toString()}`)
  
  return response
}

export const acceptOrderAPI = async (orderId: string) => {
  const response = await http.patch<ApiResponse<{ message: string; success: boolean }>>(
    `/api/v1/orders/${orderId}/accept`,
  )
  return response
}

export const deliverOrderAPI = async (orderId: string) => {
  const response = await http.patch<ApiResponse<{ message: string; success: boolean }>>(
    `/api/v1/orders/${orderId}/dispatch-to-carrier`,
  )
  return response
}

// ============ ADMIN ORDERS (Quản lý đơn hàng admin) ============

export interface AdminOrderItem {
  id: string
  productId: string
  productVariantId: string
  productName: string
  variantImage: string
  sku: string
  quantity: number
  finalPrice: number
  returnReason?: string | null
  returnStatus?: 'NONE' | 'REFUNDED'
  returnRequestedAt?: string | null
  returnResolvedAt?: string | null
}

export interface AdminOrder {
  id: string
  userId: string
  shopId: string
  buyerUsername: string
  buyerAvatar: string | null
  review?: string | null
  status: string
  paymentMethod: string
  goodsPrice: number
  finalPrice: number | string
  shippingAddress: string
  receiverName: string
  receiverPhoneNumber: string
  subtotal: number
  shippingFee: number
  szoneVoucherDiscount: number
  shopVoucherDiscount: number
  cancelReason?: string | null
  createdAt: string
  orderItems: AdminOrderItem[]
}

export interface AdminOrdersPaginatedResponse {
  items: AdminOrder[]
  meta: OffsetMeta
}

export const getAdminOrdersPaginatedAPI = async (
  params: { status: string; page?: number; limit?: number; search?: string; returnStatus?: string }
) => {
  const searchParams = new URLSearchParams()
  searchParams.set('status', params.status)
  if (params.returnStatus) searchParams.set('returnStatus', params.returnStatus)
  if (params.page) searchParams.set('page', String(params.page))
  if (params.limit) searchParams.set('limit', String(params.limit))
  if (params.search) searchParams.set('search', params.search)

  const response = await http.get<ApiResponse<AdminOrdersPaginatedResponse>>(
    `/api/v1/orders?${searchParams.toString()}`
  )

  return response
}

export const requestReturnOrderItemAPI = async (
  orderItemId: string,
  returnReason: string
) => {
  const response = await http.patch<ApiResponse<{ message: string }>>(
    `/api/v1/orders/items/${orderItemId}/return-request`,
    { returnReason }
  )
  return response
}

// End file
