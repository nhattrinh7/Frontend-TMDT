import { create } from 'zustand'
import { devtools, persist } from 'zustand/middleware'
import { createUserSlice } from '~/zustand/userSlice'
import { type IUserSlice } from '~/zustand/userSlice'
import { createShopSlice } from '~/zustand/shopSlice'
import { type IShopSlice } from '~/zustand/shopSlice'
import { createCartSlice } from '~/zustand/cartSlice'
import { type ICartSlice } from '~/zustand/cartSlice'

export const useBoundStore = create<IUserSlice & IShopSlice & ICartSlice>()(
  devtools(
    persist(
      // hàm tạo store
      (...a) => ({
        ...createUserSlice(...a),
        ...createShopSlice(...a),
        ...createCartSlice(...a),
      }),
      // cấu hình persist
      {
        name: 'bound-store',
        partialize: (state) => ({ 
          user: state.user,
          shop: state.shop,
          cart: state.cart
        }), // chỉ lưu phần cần thiết
      }
    ),
    { name: 'BoundStore', enabled: true } // Tên hiện trong Redux DevTools
  )
)