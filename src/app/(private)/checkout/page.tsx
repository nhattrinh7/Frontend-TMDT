'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useBoundStore } from '~/zustand/store'
import {
  calculatePriceAPI,
  placeOrderAPI,
  confirmWalletPaymentAPI,
} from '~/apiRequests/order.apiRequest'
import { checkPassCodeAPI } from '~/apiRequests/user.apiRequest'
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
import WalletPasscodeDialog from './WalletPasscodeDialog'
import QRCodeDialog from './QRCodeDialog'
import OrderProcessingOverlay from './OrderProcessingOverlay'
import { usePaymentSocket } from '~/hooks/usePaymentSocket'
import { toast } from 'sonner'
import { ArrowLeft } from 'lucide-react'

export default function CheckoutPage() {
  const router = useRouter()
  const cart = useBoundStore((state) => state.cart)
  const removeSelectedItems = useBoundStore((state) => state.removeSelectedItems)

  // === Checkout State ===
  const [selectedAddress, setSelectedAddress] = useState<AddressData | null>(null)
  const [shopVouchers, setShopVouchers] = useState<Record<string, string>>({})
  const [selectedVoucherNames, setSelectedVoucherNames] = useState<Record<string, string>>({})
  const [szoneVoucherId, setSzoneVoucherId] = useState<string | null>(null)
  const [szoneVoucherName, setSzoneVoucherName] = useState<string | null>(null)
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('COD')
  const [priceData, setPriceData] = useState<CalculatePriceResponse | null>(null)
  const [isCalculating, setIsCalculating] = useState(true)

  // === Place Order State ===
  const [isPlacingOrder, setIsPlacingOrder] = useState(false)
  const [sagaId, setSagaId] = useState<string | null>(null)
  const [showProcessingOverlay, setShowProcessingOverlay] = useState(false)
  const [processingMessage, setProcessingMessage] = useState('Đang xử lý đơn hàng...')
  const [showWalletDialog, setShowWalletDialog] = useState(false)
  const [showQRDialog, setShowQRDialog] = useState(false)
  const [qrData, setQrData] = useState<{ qrUrl: string; amount: number } | null>(null)

  // WebSocket
  const { connect, disconnect } = usePaymentSocket()

  // Cleanup WebSocket khi unmount
  useEffect(() => {
    return () => disconnect()
  }, [disconnect])

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

  // ==================== PLACE ORDER FLOW ====================

  /**
   * Navigate to result page
   */
  const goToResult = (status: string, orderIds?: string[], message?: string) => {
    disconnect()
    const params = new URLSearchParams({ status })
    if (orderIds?.length) params.set('orderIds', orderIds.join(','))
    if (message) params.set('message', message)
    router.push(`/checkout/result?${params.toString()}`)
  }

  /**
   * Kết nối WebSocket và setup listeners
   */
  const connectWebSocket = () => {
    connect({
      onSuccess: (data) => {
        setShowProcessingOverlay(false)
        setShowWalletDialog(false)
        setShowQRDialog(false)
        removeSelectedItems() // Xóa selected items khỏi zustand cart
        goToResult('success', data.orderIds)
      },
      onFailed: (data) => {
        setShowProcessingOverlay(false)
        setShowWalletDialog(false)
        setShowQRDialog(false)
        goToResult('failed', undefined, data.message)
      },
      onTimeout: () => {
        setShowProcessingOverlay(false)
        setShowWalletDialog(false)
        setShowQRDialog(false)
        goToResult('timeout')
      },
      onQRCode: (data) => {
        setShowProcessingOverlay(false)
        setQrData({ qrUrl: data.qrUrl, amount: data.amount })
        setShowQRDialog(true)
      },
    })
  }

  /**
   * Handler chính khi nhấn 'Đặt Hàng'
   */
  const handlePlaceOrder = async () => {
    // Validate
    if (!selectedAddress) {
      toast.error('Vui lòng chọn địa chỉ giao hàng')
      return
    }
    if (!priceData) {
      toast.error('Đang tính giá, vui lòng đợi')
      return
    }

    // Nếu chọn WALLET, kiểm tra user đã tạo passcode chưa
    if (paymentMethod === 'WALLET') {
      try {
        const { data } = await checkPassCodeAPI()
        if (!data.hasPassCode) {
          toast.error('Bạn chưa thiết lập passcode cho ví. Vui lòng vào Hồ sơ → Passcode để tạo.')
          return
        }
      } catch {
        toast.error('Không thể kiểm tra passcode, vui lòng thử lại')
        return
      }
    }

    setIsPlacingOrder(true)

    try {
      // 1. Kết nối WebSocket TRƯỚC khi gọi API
      connectWebSocket()

      // 2. Gọi placeOrder API
      const itemsByShop = buildItemsByShop()
      const cleanedShopVouchers: Record<string, string> = {}
      for (const [key, val] of Object.entries(shopVouchers)) {
        if (val) cleanedShopVouchers[key] = val
      }

      const response = await placeOrderAPI({
        itemsByShop,
        shopVouchers: Object.keys(cleanedShopVouchers).length > 0 ? cleanedShopVouchers : undefined,
        szoneVoucherId: szoneVoucherId || undefined,
        expectedFinalPrice: priceData.summary.finalPrice,
        addressId: selectedAddress.id,
        paymentMethod,
      })

      const { sagaId: newSagaId } = response.data
      setSagaId(newSagaId)

      // 3. Xử lý theo phương thức thanh toán
      switch (paymentMethod) {
      case 'COD':
        // COD: show loading, chờ WebSocket payment:success
        setShowProcessingOverlay(true)
        setProcessingMessage('Đang xử lý đơn hàng...')
        break

      case 'WALLET':
        // WALLET: mở dialog nhập passcode
        setShowWalletDialog(true)
        break

      case 'QRCODE':
        // QRCODE: show loading, chờ WebSocket payment:qrcode
        setShowProcessingOverlay(true)
        setProcessingMessage('Đang tạo mã QR thanh toán...')
        break
      }
    } catch (err) {
      disconnect()
      const errorMsg = err instanceof Error ? err.message : 'Đặt hàng thất bại, vui lòng thử lại'
      toast.error(errorMsg)
      setIsPlacingOrder(false)
    }
  }

  /**
   * Handler khi user nhập passcode ví
   */
  const handleWalletConfirm = async (passcode: string) => {
    if (!sagaId) return

    setProcessingMessage('Đang xác nhận thanh toán ví...')

    const response = await confirmWalletPaymentAPI({ sagaId, passcode })

    if (!response.data.success) {
      throw new Error(response.data.error || 'Xác nhận thất bại')
    }

    // Thành công → ẩn dialog, show overlay, chờ WebSocket payment:success
    setShowWalletDialog(false)
    setShowProcessingOverlay(true)
  }

  // Redirect nếu không có items
  if (selectedShops.length === 0 && !isCalculating) {
    return (
      <>
        <Header />
        <div className='container mx-auto max-w-4xl px-6 py-12'>
          <div className='text-center'>
            <p className='text-slate-500'>Không có sản phẩm nào được chọn</p>
            <button
              onClick={() => router.push('/cart')}
              className='mt-4 rounded-lg bg-emerald-700 px-6 py-2 text-sm font-semibold text-white hover:bg-emerald-800'
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
      <div className='min-h-screen bg-gray-50 pb-12'>
        <div className='container mx-auto max-w-4xl px-6 py-6'>
          {/* Page Header */}
          <div className='mb-6 flex items-center gap-3'>
            <button
              onClick={() => router.push('/cart')}
              className='flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 transition-colors hover:bg-slate-200 hover:text-slate-700'
            >
              <ArrowLeft className='h-5 w-5' />
            </button>
            <h1 className='text-2xl font-bold text-slate-900'>Thanh Toán</h1>
          </div>

          <div className='space-y-4'>
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
              isPlacingOrder={isPlacingOrder}
            />
          </div>
        </div>
      </div>

      {/* === Overlays & Dialogs === */}

      {/* Loading overlay */}
      <OrderProcessingOverlay
        isVisible={showProcessingOverlay}
        message={processingMessage}
      />

      {/* WALLET: Passcode dialog */}
      <WalletPasscodeDialog
        open={showWalletDialog}
        onOpenChange={(open) => {
          if (!open) {
            // User đóng dialog → cancel flow
            setShowWalletDialog(false)
            disconnect()
            setIsPlacingOrder(false)
          }
        }}
        onConfirm={handleWalletConfirm}
        amount={priceData?.summary.finalPrice || 0}
      />

      {/* QRCODE: QR dialog */}
      {qrData && (
        <QRCodeDialog
          open={showQRDialog}
          onOpenChange={(open) => {
            if (!open) {
              setShowQRDialog(false)
            }
          }}
          qrUrl={qrData.qrUrl}
          amount={qrData.amount}
        />
      )}
    </>
  )
}
