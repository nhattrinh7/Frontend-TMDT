import http from '~/config/http'
import { ApiResponse } from '~/interface/response.interface'
import { CreateVoucherBodyType, Voucher } from '~/zodSchema/voucher.schema'

export const createVoucherAPI = async (data: CreateVoucherBodyType) => {
  await http.post<ApiResponse<Voucher>>('/api/v1/vouchers', data)
}

export const getShopVouchersAPI = async (shopId: string) => {
  const url = `/api/v1/vouchers?shopId=${shopId}`
  const response = await http.get<ApiResponse<Voucher[]>>(url)
  return response.data
}

export const deleteVoucherAPI = async (id: string) => {
  await http.delete<ApiResponse<void>>(`/api/v1/vouchers/${id}`)
}