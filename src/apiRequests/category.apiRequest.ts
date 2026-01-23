import http from '~/config/http'
import { ApiResponse } from '~/interface/response.interface'
import { Category } from '~/zodSchema/category.schema'

// Lấy danh sách tất cả categories
export const getCategoriesAPI = async () => {
  const response = await http.get<ApiResponse<Category[]>>('/api/v1/categories')
  return response.data
}

// Lấy danh sách ngành hàng cấp 1 (root categories)
export const getRootCategoriesAPI = async () => {
  const response = await http.get<ApiResponse<Category[]>>('/api/v1/categories/root')
  return response
}

// Lấy thông tin category theo id
export const getCategoryByIdAPI = async (categoryId: string) => {
  const response = await http.get<ApiResponse<Category>>(`/api/v1/categories/${categoryId}`)
  return response.data
}

