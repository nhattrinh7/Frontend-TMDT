import http from '~/config/http'
import { ApiResponse } from '~/interface/response.interface'

export interface WalletBalanceResponse {
  balance: number
}

export interface AddMoneyToWalletRequest {
  amount: number
}

export interface AddMoneyToWalletResponse {
  balance: number
}

export const getWalletBalanceAPI = async () => {
  const response = await http.get<ApiResponse<WalletBalanceResponse>>(
    '/api/v1/users/wallet'
  )

  return response.data
}

export const addMoneyToWalletAPI = async (data: AddMoneyToWalletRequest) => {
  const response = await http.post<ApiResponse<AddMoneyToWalletResponse>>(
    '/api/v1/users/wallet/add-money',
    data
  )

  return response.data
}
