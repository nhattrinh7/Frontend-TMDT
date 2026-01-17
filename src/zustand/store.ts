import { create } from 'zustand'
import { devtools, persist } from 'zustand/middleware'
import { createUserSlice } from '~/zustand/userSlice'
import { type IUserSlice } from '~/zustand/userSlice'
import { createShopSlice } from '~/zustand/shopSlice'
import { type IShopSlice } from '~/zustand/shopSlice'

export const useBoundStore = create<IUserSlice & IShopSlice>()(
  devtools(
    persist(
      // hàm tạo store
      (...a) => ({
        ...createUserSlice(...a),
        ...createShopSlice(...a),
      }),
      // cấu hình persist
      {
        name: 'bound-store',
        partialize: (state) => ({ 
          user: state.user,
          shop: state.shop 
        }), // chỉ lưu phần cần thiết
      }
    ),
    { name: 'BoundStore', enabled: true } // Tên hiện trong Redux DevTools
  )
)