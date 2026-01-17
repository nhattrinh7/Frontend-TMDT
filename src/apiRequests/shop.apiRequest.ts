import http from '~/config/http'
import { ApiResponse } from '~/interface/response.interface'
import { CreateShopBodyType, Shop, UpdateShopBodyType } from '~/zodSchema/shop.schema'

export const createShopAPI = async (data: CreateShopBodyType) => {
  await http.post<ApiResponse>('/api/v1/shops', data)
}

// Check người dùng đã có shop chưa
export const checkUserHasShopAPI = async () => {
  const response = await http.get<ApiResponse<{ hasShop: boolean }>>('/api/v1/shops/has-shop')
  return response
}

// Lấy thông tin shop
export const getShopByOwnerIdAPI = async () => {
  const response = await http.get<ApiResponse>('/api/v1/shops')
  return response.data
}

// Cập nhật avatar shop
export const updateShopLogoAPI = async (shopId: string, logo: FormData) => {
  const response = await http.patch<ApiResponse<Shop>>(`/api/v1/shops/${shopId}/logo`, logo)
  return response.data
}

// Cập nhật thông tin shop
export const updateShopInfoAPI = async (shopId: string, data: Partial<UpdateShopBodyType>) => {
  const response = await http.put<ApiResponse<Shop>>(`/api/v1/shops/${shopId}`, data)
  return response.data
}

// Bật tắt trạng thái tham gia sale của shop
export const toggleShopJoinSaleCampaignAPI = async (shopId: string) => {
  await http.patch<ApiResponse<Shop>>(`/api/v1/shops/${shopId}/sale-campaign`)
}