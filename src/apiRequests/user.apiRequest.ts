import http from '~/config/http'
import { ApiResponse } from '~/interface/response.interface'
import { 
  UpdateProfileBodyType,
  UploadProfileResType,
  GetProfileResType,
  GetAddressResType,
  AddAddressResType,
  DeleteAddressResType,
  UpdateAddressResType,
  UpdateAddressBodyType,
  ChangePasswordBodyType,
  CountCartItemsResType,
  GetCartResType,
  CheckCartToAddResType
} from '~/zodSchema/user.schema'
import { Address } from '~/components/AddressManagement'

// GET PROFILE 
export const getProfileAPI = async (userId: string,) => {
  const response = await http.get<ApiResponse<GetProfileResType>>(`/api/v1/users/${userId}`)
  return response
}

// UPLOAD USER AVATAR
export const uploadAvatarAPI = async (
  userId: string, 
  data: FormData
) => {

  const response = await http.patch<ApiResponse<UploadProfileResType>>(`/api/v1/users/${userId}/avatar`, data)
  return response
}

// UPDATE USER PROFILE
export const updateProfileAPI = async (
  userId: string, 
  data: UpdateProfileBodyType
) => {
  const response = await http.put<ApiResponse<UploadProfileResType>>(`/api/v1/users/${userId}`, data)
  return response
}

// USER ADDRESS
export const getAddressesAPI = async (userId: string) => {
  const response = await http.get<ApiResponse<GetAddressResType[]>>(`/api/v1/users/${userId}/address`)
  return response
}

export const getDefaultAddressAPI = async (userId: string) => {
  const response = await http.get<ApiResponse<GetAddressResType>>(`/api/v1/users/${userId}/address/default`)
  return response
}

export const addAddressAPI = async (
  userId: string,
  data: Omit<Address, 'id'>
) => {
  const response = await http.post<ApiResponse<AddAddressResType>>(`/api/v1/users/${userId}/address`, data)
  return response
}

export const deleteAddressAPI = async (addressId: string,) => {
  const response = await http.delete<ApiResponse<DeleteAddressResType[]>>(`/api/v1/users/address/${addressId}`)
  return response
}

export const updateAddressAPI = async (addressId: string, data: UpdateAddressBodyType) => {
  const response = await http.put<ApiResponse<UpdateAddressResType>>(`/api/v1/users/address/${addressId}`, data)
  return response
}

export const setDefaultAddressAPI = async (addressId: string) => {
  await http.patch<ApiResponse<unknown>>(`/api/v1/users/address/${addressId}/set-default`)
}

// Đổi mật khẩu
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const changePasswordAPI = async (userId: string, data: ChangePasswordBodyType): Promise<any> => {
  await http.put<ApiResponse>(`/api/v1/users/${userId}/change-password`, data)
}

// Đếm số lượng cart items
export const countCartItemsAPI = async (userId: string) => {
  const response = await http.get<ApiResponse<CountCartItemsResType>>(`/api/v1/users/${userId}/count-cart-items`)
  return response
}

// Lấy giỏ hàng
export const getCartAPI = async (userId: string) => {
  const response = await http.get<ApiResponse<GetCartResType>>(`/api/v1/users/${userId}/cart`)
  return response
}

// Thêm vào giỏ hàng (check trước khi add)
export const addToCartAPI = async (data: { productVariantId: string; quantity: number }) => {
  const response = await http.put<ApiResponse<CheckCartToAddResType>>('/api/v1/users/add-to-cart', data)
  return response
}

// Xóa cart items
export const deleteCartItemsAPI = async (data: { productVariantIds: string[] }) => {
  const response = await http.patch<ApiResponse<{ deletedCount: number }>>('/api/v1/users/delete-cart-items', data)
  return response
}

// Cập nhật số lượng cart item
export const updateCartQuantityAPI = async (data: { productVariantId: string; quantity: number }) => {
  const response = await http.put<ApiResponse<{ productVariantId: string; quantity: number }>>('/api/v1/users/update-cart-quantity', data)
  return response
}

// ===== PASSCODE =====

// Kiểm tra user đã có passcode chưa
export const checkPassCodeAPI = async () => {
  const response = await http.get<ApiResponse<{ hasPassCode: boolean }>>('/api/v1/users/check-pass-code')
  return response
}

// Tạo passcode
export const createPassCodeAPI = async (data: { passCode: string }) => {
  await http.post<ApiResponse>('/api/v1/users/pass-code', data)
}

// Đổi passcode
export const changePassCodeAPI = async (data: { currentPassCode: string; newPassCode: string }) => {
  await http.put<ApiResponse>('/api/v1/users/change-pass-code', data)
}

// Yêu cầu gửi OTP reset passcode
export const requestPassCodeResetAPI = async () => {
  await http.post<ApiResponse>('/api/v1/users/request-pass-code-reset')
}

// Reset passcode (xác nhận OTP + passcode mới)
export const resetPassCodeAPI = async (data: { otp: string; newPassCode: string }) => {
  await http.put<ApiResponse>('/api/v1/users/reset-pass-code', data)
}
