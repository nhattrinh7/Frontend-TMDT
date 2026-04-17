'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { getCartAPI, deleteCartItemsAPI, updateCartQuantityAPI } from '~/apiRequests/user.apiRequest'
import { checkInventoryToMinusAPI, checkInventoryToPlusAPI } from '~/apiRequests/inventory.apiRequest'
import { useBoundStore } from '~/zustand/store'
import { Checkbox } from '~/components/ui/checkbox'
import { Minus, Plus, Trash2 } from 'lucide-react'
import Header from '~/app/(public)/Header'
import { toast } from 'sonner'

export default function CartPage() {
  const user = useBoundStore((state) => state.user)
  const cart = useBoundStore((state) => state.cart)
  const setCart = useBoundStore((state) => state.setCart)
  const toggleItem = useBoundStore((state) => state.toggleItem)
  const toggleShop = useBoundStore((state) => state.toggleShop)
  const toggleAll = useBoundStore((state) => state.toggleAll)
  const updateQuantity = useBoundStore((state) => state.updateQuantity)
  const removeItem = useBoundStore((state) => state.removeItem)
  const removeSelectedItems = useBoundStore((state) => state.removeSelectedItems)
  
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    // Nếu đã có data trong store thì không gọi API
    if (cart.length > 0) {
      setLoading(false)
      return
    }

    const fetchCart = async () => {
      if (!user?.id) return

      try {
        setLoading(true)
        const response = await getCartAPI(user.id)
        setCart(response.data) // setCart tự động thêm isSelected=false
      } catch (error) {
        console.error('Error fetching cart:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchCart()
  }, [user?.id, cart.length, setCart])

  // Tính tổng tiền của các sản phẩm đã chọn
  const calculateTotal = () => {
    let total = 0
    cart.forEach((shop) => {
      shop.items.forEach((item) => {
        if (item.isSelected) {
          total += item.price * item.quantity
        }
      })
    })
    return total
  }

  // Format giá
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(price)
  }

  // Tính số lượng items đã chọn
  const selectedCount = cart.reduce((count, shop) => {
    return count + shop.items.filter(item => item.isSelected).length
  }, 0)

  // Xóa các sản phẩm đã chọn
  const handleDeleteSelected = async () => {
    const selectedItems = cart.flatMap(shop => 
      shop.items.filter(item => item.isSelected)
    )
    const productVariantIds = selectedItems.map(item => item.productVariantId)

    if (productVariantIds.length === 0) return

    try {
      await deleteCartItemsAPI({ productVariantIds })
      removeSelectedItems()
      toast.success(`Đã xóa ${productVariantIds.length} sản phẩm khỏi giỏ hàng`)
    } catch (error) {
      toast.error('Không thể xóa sản phẩm')
      console.error('Error deleting items:', error)
    }
  }

  // Tăng số lượng
  const handleIncrease = async (itemId: string) => {
    const item = cart.flatMap(s => s.items).find(i => i.id === itemId)
    if (!item) return

    const newQuantity = item.quantity + 1

    try {
      // Gọi API kiểm tra tồn kho
      const response = await checkInventoryToPlusAPI({
        productVariantId: item.productVariantId,
        quantity: newQuantity
      })

      const { isPlusSuccess, quantity } = response.data

      // Cập nhật quantity vào zustand
      updateQuantity(itemId, quantity)

      // Đồng bộ quantity với backend
      await updateCartQuantityAPI({
        productVariantId: item.productVariantId,
        quantity
      })

      // Nếu không thành công, hiển thị thông báo (optional)
      if (!isPlusSuccess) {
        console.warn(`Số lượng tối đa có thể mua: ${quantity}`)
      }
    } catch (error) {
      console.error('Error checking inventory:', error)
    }
  }

  // Giảm số lượng
  const handleDecrease = async (itemId: string) => {
    const item = cart.flatMap(s => s.items).find(i => i.id === itemId)
    if (!item || item.quantity <= 1) return

    const newQuantity = item.quantity - 1

    try {
      // Gọi API kiểm tra tồn kho
      const response = await checkInventoryToMinusAPI({
        productVariantId: item.productVariantId,
        quantity: newQuantity
      })

      const { isMinusSuccess, quantity } = response.data

      // Cập nhật quantity vào zustand
      updateQuantity(itemId, quantity)

      // Đồng bộ quantity với backend
      await updateCartQuantityAPI({
        productVariantId: item.productVariantId,
        quantity
      })

      // Nếu không thành công, hiển thị thông báo (optional)
      if (!isMinusSuccess) {
        console.warn(`Số lượng tối đa có thể mua: ${quantity}`)
      }
    } catch (error) {
      console.error('Error checking inventory:', error)
    }
  }

  // Xóa 1 sản phẩm
  const handleDeleteItem = async (itemId: string) => {
    const item = cart.flatMap(s => s.items).find(i => i.id === itemId)
    if (!item) return

    try {
      await deleteCartItemsAPI({ productVariantIds: [item.productVariantId] })
      removeItem(itemId)
      toast.success('Đã xóa sản phẩm khỏi giỏ hàng')
    } catch (error) {
      toast.error('Không thể xóa sản phẩm')
      console.error('Error deleting item:', error)
    }
  }

  // Mua hàng
  const handleCheckout = () => {
    const hasSelectedItems = cart.some(shop => 
      shop.items.some(item => item.isSelected)
    )
    if (!hasSelectedItems) {
      toast.error('Vui lòng chọn ít nhất 1 sản phẩm')
      return
    }
    router.push('/checkout')
  }

  if (loading) {
    return (
      <>
        <Header />
        <div className='container mx-auto max-w-7xl px-6 py-8'>
          <div className='flex items-center justify-center py-20'>
            <div className='text-slate-500'>Đang tải giỏ hàng...</div>
          </div>
        </div>
      </>
    )
  }

  if (cart.length === 0) {
    return (
      <>
        <Header />
        <div className='container mx-auto max-w-7xl px-6 py-8'>
          <div className='flex flex-col items-center justify-center py-20'>
            <svg
              className='mb-4 h-24 w-24 text-slate-300'
              fill='none'
              stroke='currentColor'
              viewBox='0 0 24 24'
            >
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={1.5}
                d='M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z'
              />
            </svg>
            <h2 className='mb-2 text-2xl font-bold text-slate-900'>Giỏ hàng trống</h2>
            <p className='text-slate-500'>Hãy thêm sản phẩm vào giỏ hàng để tiếp tục mua sắm</p>
          </div>
        </div>
      </>
    )
  }

  const allItemIds = cart.flatMap((shop) => shop.items.map((item) => item.id))
  const isAllSelected = allItemIds.length > 0 && allItemIds.every((item) => {
    const cartItem = cart.flatMap(s => s.items).find(i => i.id === item)
    return cartItem?.isSelected ?? false
  })

  return (
    <>
      <Header />
      <div className='min-h-screen bg-gray-50 pb-32'>
        <div className='container mx-auto max-w-7xl px-6 py-8'>
          {/* Header */}
          <div className='mb-6'>
            <h1 className='text-2xl font-bold text-slate-900'>Giỏ Hàng Của Bạn</h1>
            <p className='mt-1 text-sm text-slate-500'>
              {allItemIds.length} sản phẩm
            </p>
          </div>

          {/* Main Content */}
          <div className='space-y-4'>
            {/* Header Row */}
            <div className='rounded-lg border border-slate-200 bg-white px-6 py-4'>
              <div className='flex items-center gap-4'>
                <Checkbox checked={isAllSelected} onCheckedChange={toggleAll} />
                <span className='text-sm font-medium text-slate-900'>
                  Chọn tất cả ({allItemIds.length} sản phẩm)
                </span>
              </div>
            </div>

            {/* Shop Groups */}
            {cart.map((shop) => {
              const isShopSelected = shop.items.length > 0 && shop.items.every((item) => item.isSelected)

              return (
                <div key={shop.id} className='rounded-lg border border-slate-200 bg-white'>
                  {/* Shop Header */}
                  <div className='flex items-center gap-3 border-b border-slate-200 px-6 py-4'>
                    <Checkbox
                      checked={isShopSelected}
                      onCheckedChange={() => toggleShop(shop.id)}
                    />
                    {shop.logo ? (
                      <Image
                        src={shop.logo}
                        alt={shop.name}
                        width={40}
                        height={40}
                        className='h-10 w-10 rounded-full object-cover'
                      />
                    ) : (
                      <div className='flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100'>
                        <span className='text-sm font-semibold text-emerald-700'>
                          {shop.name[0]}
                        </span>
                      </div>
                    )}
                    <span className='font-semibold text-slate-900'>{shop.name}</span>
                  </div>

                  {/* Products */}
                  <div className='divide-y divide-slate-100'>
                    {shop.items.map((item) => (
                      <div key={item.id} className='flex items-center gap-4 px-6 py-5'>
                        <Checkbox
                          checked={item.isSelected}
                          onCheckedChange={() => toggleItem(item.id)}
                        />

                        {/* Product Image */}
                        <div className='h-28 w-28 shrink-0 overflow-hidden rounded-lg border border-slate-200'>
                          {item.image ? (
                            <Image
                              src={item.image}
                              alt={item.name}
                              width={112}
                              height={112}
                              className='h-full w-full object-cover'
                            />
                          ) : (
                            <div className='flex h-full w-full items-center justify-center bg-slate-100'>
                              <span className='text-slate-400'>No image</span>
                            </div>
                          )}
                        </div>

                        {/* Product Info - Horizontal Layout */}
                        <div className='flex flex-1 items-center gap-6'>
                          {/* Name */}
                          <div className='flex-1 min-w-0'>
                            <h3 className='text-lg font-semibold text-slate-900 line-clamp-2'>
                              {item.name}
                            </h3>
                          </div>

                          {/* SKU and Price */}
                          <div className='flex items-center gap-6'>
                            {item.sku && (
                              <p className='text-base font-medium text-slate-600'>
                                Phân loại: <span className='text-slate-700'>{item.sku}</span>
                              </p>
                            )}
                            <div className='text-xl font-bold text-emerald-700 whitespace-nowrap'>
                              {formatPrice(item.price)}
                            </div>
                          </div>

                          {/* Quantity Controls */}
                          <div className='flex items-center gap-2 rounded-lg border border-slate-300'>
                            <button
                              onClick={() => handleDecrease(item.id)}
                              className='flex h-9 w-9 items-center justify-center text-slate-600 transition-colors hover:bg-slate-50 hover:text-emerald-700'
                            >
                              <Minus className='h-4 w-4' />
                            </button>
                            <span className='min-w-10 text-center text-base font-semibold text-slate-900'>
                              {item.quantity}
                            </span>
                            <button
                              onClick={() => handleIncrease(item.id)}
                              className='flex h-9 w-9 items-center justify-center text-slate-600 transition-colors hover:bg-slate-50 hover:text-emerald-700'
                            >
                              <Plus className='h-4 w-4' />
                            </button>
                          </div>

                          {/* Delete Button */}
                          <button
                            onClick={() => handleDeleteItem(item.id)}
                            className='flex h-9 w-9 items-center justify-center text-slate-400 transition-colors hover:text-red-500'
                          >
                            <Trash2 className='h-5 w-5' />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Sticky Bottom Bar */}
        <div className='fixed bottom-0 left-0 right-0 border-t border-slate-200 bg-white shadow-lg'>
          <div className='container mx-auto max-w-7xl px-6 py-4'>
            <div className='flex items-center justify-between'>
              {/* Left side - Delete button */}
              <button
                onClick={handleDeleteSelected}
                disabled={selectedCount === 0}
                className='flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-50 hover:text-red-500 disabled:cursor-not-allowed disabled:opacity-50'
              >
                <Trash2 className='h-4 w-4' />
                Xóa ({selectedCount})
              </button>

              {/* Right side - Total and Checkout */}
              <div className='flex items-center gap-6'>
                <div className='text-right'>
                  <p className='text-sm text-slate-500'>Tổng thanh toán ({selectedCount} sản phẩm):</p>
                  <p className='text-2xl font-bold text-emerald-700'>{formatPrice(calculateTotal())}</p>
                </div>
                <button
                  onClick={handleCheckout}
                  disabled={selectedCount === 0}
                  className='rounded-lg bg-emerald-800 px-12 py-3 font-semibold text-white shadow-sm transition-all hover:bg-emerald-900 disabled:cursor-not-allowed disabled:opacity-50'
                >
                  Mua Hàng
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
