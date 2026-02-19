import http from '~/config/http'
import { ApiResponse } from '~/interface/response.interface'

export interface CheckInventoryToMinusBody {
  productVariantId: string
  quantity: number
}

export interface CheckInventoryToPlusBody {
  productVariantId: string
  quantity: number
}

export interface CheckInventoryToMinusRes {
  isMinusSuccess: boolean
  quantity: number
}

export interface CheckInventoryToPlusRes {
  isPlusSuccess: boolean
  quantity: number
}

// Kiểm tra tồn kho khi giảm số lượng
export const checkInventoryToMinusAPI = async (data: CheckInventoryToMinusBody) => {
  const response = await http.put<ApiResponse<CheckInventoryToMinusRes>>(
    '/api/v1/inventories/check-inventory-to-minus',
    data
  )
  return response
}

// Kiểm tra tồn kho khi tăng số lượng
export const checkInventoryToPlusAPI = async (data: CheckInventoryToPlusBody) => {
  const response = await http.put<ApiResponse<CheckInventoryToPlusRes>>(
    '/api/v1/inventories/check-inventory-to-plus',
    data
  )
  return response
}
