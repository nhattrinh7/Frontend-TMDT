import { type StateCreator } from 'zustand'
import type { CartItemInfoType, CartGroupedByShopType } from '~/zodSchema/user.schema'

// Cart item với trường isSelected
export interface CartItemWithSelection extends CartItemInfoType {
  isSelected: boolean
}

// Cart grouped by shop với items có isSelected
export interface CartGroupedByShopWithSelection {
  id: string
  name: string
  logo: string | null
  items: CartItemWithSelection[]
}

export interface ICartSlice {
  cartItemsCount: number
  setCartItemsCount: (count: number) => void

  cart: CartGroupedByShopWithSelection[]
  setCart: (data: CartGroupedByShopType[]) => void
  toggleItem: (itemId: string) => void
  toggleShop: (shopId: string) => void
  toggleAll: () => void
  updateQuantity: (itemId: string, quantity: number) => void
  removeItem: (itemId: string) => void
  removeSelectedItems: () => void
  clearCart: () => void
  addItemToCart: (data: CartGroupedByShopType | { productVariantId: string; quantity: number }) => void
  addItemToCartWithSelection: (data: CartGroupedByShopType | { productVariantId: string; quantity: number }) => void
}

// Helper function để đếm số items trong cart
const countItems = (cart: CartGroupedByShopWithSelection[]) => {
  return cart.reduce((total, shop) => total + shop.items.length, 0)
}

export const createCartSlice: StateCreator<ICartSlice, [['zustand/devtools', never]], [], ICartSlice> = (set) => ({
  cart: [],
  cartItemsCount: 0,
  
  setCartItemsCount: (count) => set({ cartItemsCount: count }),

  // Set cart từ API data (transform để thêm isSelected=false)
  setCart: (data) => set(() => {
    const newCart = data.map(shop => ({
      ...shop,
      items: shop.items.map(item => ({
        ...item,
        isSelected: false
      }))
    }))
    return {
      cart: newCart,
      cartItemsCount: countItems(newCart)
    }
  }),
  
  // Add item to cart từ API response
  addItemToCart: (data) => set((state) => {
    let newCart = state.cart

    // Case 1: Response là {productVariantId, quantity}
    if ('productVariantId' in data && !('items' in data)) {
      newCart = state.cart.map(shop => ({
        ...shop,
        items: shop.items.map(item =>
          item.productVariantId === data.productVariantId
            ? { ...item, quantity: data.quantity }
            : item
        )
      }))
    } else {
      // Case 2: Response là shop object với items
      const shopData = data as CartGroupedByShopType
      const existingShopIndex = state.cart.findIndex(s => s.id === shopData.id)
      
      // Case 2a: Shop đã tồn tại
      if (existingShopIndex !== -1) {
        newCart = state.cart.map((shop, index) => {
          if (index !== existingShopIndex) return shop

          // Kiểm tra item đã tồn tại trong shop chưa
          const newItems = [...shop.items]
          shopData.items.forEach(newItem => {
            const existingItemIndex = newItems.findIndex(
              i => i.productVariantId === newItem.productVariantId
            )
            if (existingItemIndex !== -1) {
              // Item đã tồn tại → cập nhật quantity
              newItems[existingItemIndex] = {
                ...newItems[existingItemIndex],
                quantity: newItem.quantity
              }
            } else {
              // Item chưa tồn tại → thêm mới
              newItems.push({ ...newItem, isSelected: false })
            }
          })

          return { ...shop, items: newItems }
        })
      } else {
        // Case 2b: Shop chưa tồn tại - thêm cả shop và item
        newCart = [
          ...state.cart,
          {
            ...shopData,
            items: shopData.items.map(item => ({
              ...item,
              isSelected: false
            }))
          }
        ]
      }
    }
    
    return {
      cart: newCart,
      cartItemsCount: countItems(newCart)
    }
  }),
  
  // Add item to cart với isSelected = true (cho Buy Now)
  addItemToCartWithSelection: (data) => set((state) => {
    let newCart = state.cart

    // Case 1: Response là {productVariantId, quantity}
    if ('productVariantId' in data && !('items' in data)) {
      newCart = state.cart.map(shop => ({
        ...shop,
        items: shop.items.map(item =>
          item.productVariantId === data.productVariantId
            ? { ...item, quantity: data.quantity, isSelected: true }
            : item
        )
      }))
    } else {
      // Case 2: Response là shop object với items
      const shopData = data as CartGroupedByShopType
      const existingShopIndex = state.cart.findIndex(s => s.id === shopData.id)
      
      // Case 2a: Shop đã tồn tại
      if (existingShopIndex !== -1) {
        newCart = state.cart.map((shop, index) => {
          if (index !== existingShopIndex) return shop

          // Kiểm tra item đã tồn tại trong shop chưa
          const newItems = [...shop.items]
          shopData.items.forEach(newItem => {
            const existingItemIndex = newItems.findIndex(
              i => i.productVariantId === newItem.productVariantId
            )
            if (existingItemIndex !== -1) {
              // Item đã tồn tại → cập nhật quantity + isSelected
              newItems[existingItemIndex] = {
                ...newItems[existingItemIndex],
                quantity: newItem.quantity,
                isSelected: true
              }
            } else {
              // Item chưa tồn tại → thêm mới
              newItems.push({ ...newItem, isSelected: true })
            }
          })

          return { ...shop, items: newItems }
        })
      } else {
        // Case 2b: Shop chưa tồn tại - thêm cả shop và item
        newCart = [
          ...state.cart,
          {
            ...shopData,
            items: shopData.items.map(item => ({
              ...item,
              isSelected: true
            }))
          }
        ]
      }
    }

    return {
      cart: newCart,
      cartItemsCount: countItems(newCart)
    }
  }),
  
  // Toggle một item
  toggleItem: (itemId) => set((state) => ({
    cart: state.cart.map(shop => ({
      ...shop,
      items: shop.items.map(item =>
        item.id === itemId
          ? { ...item, isSelected: !item.isSelected }
          : item
      )
    }))
  })),
  
  // Toggle tất cả items của một shop
  toggleShop: (shopId) => set((state) => {
    const shop = state.cart.find(s => s.id === shopId)
    if (!shop) return state
    
    const allSelected = shop.items.every(item => item.isSelected)
    
    return {
      cart: state.cart.map(s =>
        s.id === shopId
          ? { ...s, items: s.items.map(item => ({ ...item, isSelected: !allSelected })) }
          : s
      )
    }
  }),
  
  // Toggle tất cả items
  toggleAll: () => set((state) => {
    const allItems = state.cart.flatMap(shop => shop.items)
    const allSelected = allItems.length > 0 && allItems.every(item => item.isSelected)
    
    return {
      cart: state.cart.map(shop => ({
        ...shop,
        items: shop.items.map(item => ({ ...item, isSelected: !allSelected }))
      }))
    }
  }),
  
  // Cập nhật số lượng
  updateQuantity: (itemId, quantity) => set((state) => ({
    cart: state.cart.map(shop => ({
      ...shop,
      items: shop.items.map(item =>
        item.id === itemId
          ? { ...item, quantity }
          : item
      )
    }))
  })),
  
  // Xóa một item
  removeItem: (itemId) => set((state) => {
    const newCart = state.cart.map(shop => ({
      ...shop,
      items: shop.items.filter(item => item.id !== itemId)
    })).filter(shop => shop.items.length > 0)
    
    return {
      cart: newCart,
      cartItemsCount: countItems(newCart)
    }
  }),
  
  // Xóa các items đã chọn
  removeSelectedItems: () => set((state) => {
    const newCart = state.cart.map(shop => ({
      ...shop,
      items: shop.items.filter(item => !item.isSelected)
    })).filter(shop => shop.items.length > 0)
    
    return {
      cart: newCart,
      cartItemsCount: countItems(newCart)
    }
  }),
  
  // Clear toàn bộ cart
  clearCart: () => set({ cart: [], cartItemsCount: 0 })
})
