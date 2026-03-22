/**
 * Search Product interface
 */
export interface SearchProduct {
  id: string
  name: string
  main_image: string
  price: {
    min: number
    max: number
  }
  ratingAvg: number
  buy_count: number
}

/**
 * Search Shop interface
 */
export interface SearchShop {
  id: string
  name: string
  description: string
  logo: string
}

/**
 * Pagination meta interface
 */
export interface PaginationMeta {
  page: number
  limit: number
  total: number
  totalPages: number
}

/**
 * Search Response interface
 */
export interface SearchResponse {
  products: {
    items: SearchProduct[]
    meta: PaginationMeta
  }
  shops: {
    items: SearchShop[]
    meta: PaginationMeta
  }
}

export interface TodayRecommendationsResponse {
  items: SearchProduct[]
}

/**
 * Search API params interface
 */
export interface SearchParams {
  page?: number
  limit?: number
  search?: string
  rootCategory?: string
  minPrice?: number
  maxPrice?: number
  sort?: 'asc' | 'desc'
  minRating?: number
  maxRating?: number
  shopId?: string
}
