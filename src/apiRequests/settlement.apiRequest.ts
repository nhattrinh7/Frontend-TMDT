import http from '~/config/http'
import { ApiResponse } from '~/interface/response.interface'
import { Settlement } from '~/zodSchema/settlement.schema'
import type { OffsetMeta } from '~/apiRequests/order.apiRequest'

export type SettlementStatus = 'PENDING' | 'COMPLETED'

export interface GetShopSettlementsParams {
  status: SettlementStatus
  startDate: string
  endDate: string
  page?: number
  limit?: number
}

export interface GetShopSettlementsResponse {
  items: Settlement[]
  meta: OffsetMeta
  totalPayout: number
}

export const getShopSettlementsAPI = async (
  shopId: string,
  params: GetShopSettlementsParams,
) => {
  const searchParams = new URLSearchParams()
  searchParams.set('status', params.status)
  searchParams.set('startDate', params.startDate)
  searchParams.set('endDate', params.endDate)
  if (params.page) searchParams.set('page', String(params.page))
  if (params.limit) searchParams.set('limit', String(params.limit))

  const response = await http.get<ApiResponse<GetShopSettlementsResponse>>(
    `/api/v1/settlements/shop/${shopId}?${searchParams.toString()}`
  )

  return response.data
}
