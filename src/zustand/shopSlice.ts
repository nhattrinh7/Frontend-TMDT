import { type StateCreator } from 'zustand'
import { Shop } from '~/zodSchema/shop.schema'

export interface IShopSlice {
  shop: Shop | null
  setShop: (shop: Shop) => void
  clearShop: () => void
}

export const createShopSlice : StateCreator<IShopSlice, [['zustand/devtools', never]], [], IShopSlice> = (set) => ({
  shop: null,
  setShop: (shop) => set({ shop }),
  clearShop: () => set({ shop: null }),
})