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
  ChangePasswordBodyType
} from '~/zodSchema/user.schema'
import { Address } from '~/app/(private)/profile/AddressManagement'

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

