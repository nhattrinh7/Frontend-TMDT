'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useBoundStore } from '~/zustand/store'
import { calculatePriceAPI } from '~/apiRequests/order.apiRequest'
import type {
  CalculatePriceResponse,
  CalculatePriceRequest,
  EligibleVoucherItem,
} from '~/apiRequests/order.apiRequest'
import Header from '~/app/(public)/Header'
import AddressSection, { type AddressData } from './AddressSection'
import ShopItemsSection from './ShopItemsSection'
import SzoneVoucherSection from './SzoneVoucherSection'
import PaymentMethodSection, { type PaymentMethod } from './PaymentMethodSection'
import OrderSummary from './OrderSummary'
import { toast } from 'sonner'
import { ArrowLeft } from 'lucide-react'

export default function CheckoutPage() {
  const router = useRouter()
  const user = useBoundStore((state) => state.user)
  const cart = useBoundStore((state) => state.cart)

  // State
  const [selectedAddress, setSelectedAddress] = useState<AddressData | null>(null)
  const [shopVouchers, setShopVouchers] = useState<Record<string, string>>({})
  const [selectedVoucherNames, setSelectedVoucherNames] = useState<Record<string, string>>({})
  const [szoneVoucherId, setSzoneVoucherId] = useState<string | null>(null)
  const [szoneVoucherName, setSzoneVoucherName] = useState<string | null>(null)
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('COD')
  const [priceData, setPriceData] = useState<CalculatePriceResponse | null>(null)
  const [isCalculating, setIsCalculating] = useState(true)

  // Lấy selected items từ cart store
  const selectedShops = cart
    .map((shop) => ({
      ...shop,
      items: shop.items.filter((item) => item.isSelected),
    }))
    .filter((shop) => shop.items.length > 0)

  // Build itemsByShop cho API calculatePrice
  const buildItemsByShop = useCallback((): CalculatePriceRequest['itemsByShop'] => {
    const itemsByShop: CalculatePriceRequest['itemsByShop'] = {}
    selectedShops.forEach((shop) => {
      itemsByShop[shop.id] = shop.items.map((item) => ({
        productId: item.productId,
        productVariantId: item.productVariantId,
        quantity: item.quantity,
      }))
    })
    return itemsByShop
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cart])

  // Build allItems cho API eligible vouchers
  const allEligibleItems: EligibleVoucherItem[] = selectedShops.flatMap((shop) =>
    shop.items.map((item) => ({
      productId: item.productId,
      productVariantId: item.productVariantId,
      quantity: item.quantity,
      price: item.price,
    }))
  )

  // Gọi calculatePrice API
  const fetchCalculatePrice = useCallback(
    async (
      overrideShopVouchers?: Record<string, string>,
      overrideSzoneVoucherId?: string | null
    ) => {
      const itemsByShop = buildItemsByShop()
      if (Object.keys(itemsByShop).length === 0) return

      setIsCalculating(true)
      try {
        const request: CalculatePriceRequest = {
          itemsByShop,
          shopVouchers:
            overrideShopVouchers !== undefined ? overrideShopVouchers : shopVouchers,
        }

        const szone = overrideSzoneVoucherId !== undefined ? overrideSzoneVoucherId : szoneVoucherId
        if (szone) {
          request.szoneVoucherId = szone
        }

        // Clean shopVouchers: remove empty entries
        if (request.shopVouchers) {
          const cleaned: Record<string, string> = {}
          for (const [key, val] of Object.entries(request.shopVouchers)) {
            if (val) cleaned[key] = val
          }
          request.shopVouchers = Object.keys(cleaned).length > 0 ? cleaned : undefined
        }

        const response = await calculatePriceAPI(request)
        setPriceData(response.data)
      } catch {
        toast.error('Không thể tính giá, vui lòng thử lại')
      } finally {
        setIsCalculating(false)
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [buildItemsByShop, shopVouchers, szoneVoucherId]
  )

  // Gọi calculatePrice khi mount
  const hasFetched = useRef(false)
  useEffect(() => {
    if (hasFetched.current) return
    if (selectedShops.length === 0) {
      router.push('/cart')
      return
    }
    hasFetched.current = true
    fetchCalculatePrice()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Handler khi chọn shop voucher
  const handleShopVoucherChange = (shopId: string, voucherId: string | null, voucherName: string | null) => {
    const newShopVouchers = { ...shopVouchers }
    const newVoucherNames = { ...selectedVoucherNames }

    if (voucherId) {
      newShopVouchers[shopId] = voucherId
      newVoucherNames[shopId] = voucherName || ''
    } else {
      delete newShopVouchers[shopId]
      delete newVoucherNames[shopId]
    }

    setShopVouchers(newShopVouchers)
    setSelectedVoucherNames(newVoucherNames)

    // Gọi lại calculatePrice
    fetchCalculatePrice(newShopVouchers, undefined)
  }

  // Handler khi chọn szone voucher
  const handleSzoneVoucherChange = (voucherId: string | null, voucherName: string | null) => {
    setSzoneVoucherId(voucherId)
    setSzoneVoucherName(voucherName)

    // Gọi lại calculatePrice
    fetchCalculatePrice(undefined, voucherId)
  }

  // Handler đặt hàng
  const handlePlaceOrder = () => {
    if (!selectedAddress) {
      toast.error('Vui lòng chọn địa chỉ giao hàng')
      return
    }
    // TODO: Gọi API place-order
    toast.success('Chức năng đặt hàng đang được phát triển!')
  }

  // Redirect nếu không có items
  if (selectedShops.length === 0 && !isCalculating) {
    return (
      <>
        <Header />
        <div className="container mx-auto max-w-4xl px-6 py-12">
          <div className="text-center">
            <p className="text-slate-500">Không có sản phẩm nào được chọn</p>
            <button
              onClick={() => router.push('/cart')}
              className="mt-4 rounded-lg bg-emerald-700 px-6 py-2 text-sm font-semibold text-white hover:bg-emerald-800"
            >
              Quay lại giỏ hàng
            </button>
          </div>
        </div>
      </>
    )
  }

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gray-50 pb-12">
        <div className="container mx-auto max-w-4xl px-6 py-6">
          {/* Page Header */}
          <div className="mb-6 flex items-center gap-3">
            <button
              onClick={() => router.push('/cart')}
              className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 transition-colors hover:bg-slate-200 hover:text-slate-700"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <h1 className="text-2xl font-bold text-slate-900">Thanh Toán</h1>
          </div>

          <div className="space-y-4">
            {/* 1. Địa chỉ */}
            <AddressSection
              selectedAddress={selectedAddress}
              onAddressChange={setSelectedAddress}
            />

            {/* 2. Items theo shop + shop voucher */}
            {priceData && (
              <ShopItemsSection
                itemsWithShop={priceData.itemsWithShop}
                shopVouchers={shopVouchers}
                selectedVoucherNames={selectedVoucherNames}
                onShopVoucherChange={handleShopVoucherChange}
                allItems={allEligibleItems}
              />
            )}

            {/* 3. Voucher sàn */}
            <SzoneVoucherSection
              szoneVoucherId={szoneVoucherId}
              szoneVoucherName={szoneVoucherName}
              onSzoneVoucherChange={handleSzoneVoucherChange}
              allItems={allEligibleItems}
            />

            {/* 4. Phương thức thanh toán */}
            <PaymentMethodSection
              paymentMethod={paymentMethod}
              onPaymentMethodChange={setPaymentMethod}
            />

            {/* 5. Tổng kết */}
            <OrderSummary
              summary={priceData?.summary || null}
              isLoading={isCalculating}
              onPlaceOrder={handlePlaceOrder}
            />
          </div>
        </div>
      </div>
    </>
  )
}
