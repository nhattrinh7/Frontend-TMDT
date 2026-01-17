/* eslint-disable @typescript-eslint/no-explicit-any */

export interface ApiResponse<T = any> {
  success: boolean
  message: string
  data: T
}

// export interface ApiErrorResponse {
//   success: false
//   message: string
//   errors?: Record<string, string[]> // cho validation errors
// }