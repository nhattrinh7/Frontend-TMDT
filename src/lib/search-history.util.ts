const SEARCH_HISTORY_KEY = 'search-history'
const MAX_HISTORY_ITEMS = 10

/**
 * Lấy danh sách lịch sử tìm kiếm từ localStorage
 * @returns Mảng các query string đã tìm kiếm
 */
export function getSearchHistory(): string[] {
  if (typeof window === 'undefined') return []
  
  try {
    const history = localStorage.getItem(SEARCH_HISTORY_KEY)
    return history ? JSON.parse(history) : []
  } catch {
    return []
  }
}

/**
 * Thêm query vào lịch sử tìm kiếm
 * - Nếu query đã tồn tại, đưa lên đầu
 * - Giới hạn tối đa 10 items
 * @param query - Query string cần thêm
 */
export function addSearchHistory(query: string): void {
  if (typeof window === 'undefined') return
  if (!query.trim()) return
  
  try {
    let history = getSearchHistory()
    
    // Xóa query nếu đã tồn tại (để đưa lên đầu)
    history = history.filter(item => item !== query)
    
    // Thêm query mới vào đầu
    history.unshift(query)
    
    // Giới hạn tối đa MAX_HISTORY_ITEMS items
    if (history.length > MAX_HISTORY_ITEMS) {
      history = history.slice(0, MAX_HISTORY_ITEMS)
    }
    
    localStorage.setItem(SEARCH_HISTORY_KEY, JSON.stringify(history))
  } catch {
    // Ignore errors
  }
}

/**
 * Xóa một item khỏi lịch sử tìm kiếm theo index
 * @param index - Index của item cần xóa
 */
export function removeSearchHistory(index: number): void {
  if (typeof window === 'undefined') return
  
  try {
    const history = getSearchHistory()
    
    if (index >= 0 && index < history.length) {
      history.splice(index, 1)
      localStorage.setItem(SEARCH_HISTORY_KEY, JSON.stringify(history))
    }
  } catch {
    // Ignore errors
  }
}

/**
 * Xóa toàn bộ lịch sử tìm kiếm
 */
export function clearSearchHistory(): void {
  if (typeof window === 'undefined') return
  
  try {
    localStorage.removeItem(SEARCH_HISTORY_KEY)
  } catch {
    // Ignore errors
  }
}
