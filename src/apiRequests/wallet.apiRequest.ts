import http from '~/config/http'
import { ApiResponse } from '~/interface/response.interface'

export interface WalletBalanceResponse {
  balance: number
}

export const getWalletBalanceAPI = async () => {
  const response = await http.get<ApiResponse<WalletBalanceResponse>>(
    '/api/v1/users/wallet'
  )

  return response.data
}
