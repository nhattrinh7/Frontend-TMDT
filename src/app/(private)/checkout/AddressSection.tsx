'use client'

import { useState, useEffect, useCallback } from 'react'
import { MapPin, Phone } from 'lucide-react'
import { useBoundStore } from '~/zustand/store'
import { getDefaultAddressAPI, getAddressesAPI } from '~/apiRequests/user.apiRequest'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '~/components/ui/dialog'
import { toast } from 'sonner'

export interface AddressData {
  id: string
  recipientName: string
  recipientPhoneNumber: string
  province: string
  ward: string
  detail: string
  isDefault: boolean
}

interface AddressSectionProps {
  selectedAddress: AddressData | null
  onAddressChange: (address: AddressData) => void
}

export default function AddressSection({ selectedAddress, onAddressChange }: AddressSectionProps) {
  const user = useBoundStore((state) => state.user)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [allAddresses, setAllAddresses] = useState<AddressData[]>([])
  const [loadingAddresses, setLoadingAddresses] = useState(false)

  // Load địa chỉ mặc định khi mount
  useEffect(() => {
    if (!user?.id || selectedAddress) return

    const fetchDefaultAddress = async () => {
      try {
        const response = await getDefaultAddressAPI(user.id)
        if (response.data) {
          onAddressChange(response.data as AddressData)
        }
      } catch {
        toast.error('Không thể tải địa chỉ mặc định')
      }
    }

    fetchDefaultAddress()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id])

  // Mở dialog chọn địa chỉ
  const handleOpenDialog = useCallback(async () => {
    if (!user?.id) return

    setIsDialogOpen(true)
    setLoadingAddresses(true)

    try {
      const response = await getAddressesAPI(user.id)
      setAllAddresses(response.data as AddressData[])
    } catch {
      toast.error('Không thể tải danh sách địa chỉ')
    } finally {
      setLoadingAddresses(false)
    }
  }, [user?.id])

  const handleSelectAddress = (address: AddressData) => {
    onAddressChange(address)
    setIsDialogOpen(false)
  }

  return (
    <div className='rounded-lg border border-slate-200 bg-white p-6'>
      {/* Header */}
      <div className='mb-4 flex items-center gap-2'>
        <MapPin className='h-5 w-5 text-emerald-700' />
        <h2 className='text-lg font-bold text-slate-900'>Địa Chỉ Nhận Hàng</h2>
      </div>

      {selectedAddress ? (
        <div className='flex items-start justify-between'>
          <div className='space-y-1.5'>
            <div className='flex items-center gap-3'>
              <span className='font-semibold text-slate-900'>{selectedAddress.recipientName}</span>
              <span className='text-slate-300'>|</span>
              <div className='flex items-center gap-1.5 text-slate-600'>
                <Phone className='h-3.5 w-3.5' />
                <span>{selectedAddress.recipientPhoneNumber}</span>
              </div>
              {selectedAddress.isDefault && (
                <span className='rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-semibold text-emerald-700'>
                  Mặc định
                </span>
              )}
            </div>
            <p className='text-sm text-slate-500'>
              {selectedAddress.detail}, {selectedAddress.ward}, {selectedAddress.province}
            </p>
          </div>

          <button
            onClick={handleOpenDialog}
            className='shrink-0 rounded-lg border border-emerald-700 px-4 py-2 text-sm font-semibold text-emerald-700 transition-all hover:bg-emerald-50'
          >
            Thay đổi
          </button>
        </div>
      ) : (
        <div className='flex items-center justify-between'>
          <p className='text-sm text-slate-500'>Chưa có địa chỉ giao hàng</p>
          <button
            onClick={handleOpenDialog}
            className='rounded-lg bg-emerald-700 px-4 py-2 text-sm font-semibold text-white transition-all hover:bg-emerald-800'
          >
            Chọn địa chỉ
          </button>
        </div>
      )}

      {/* Dialog chọn địa chỉ */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className='max-w-xl'>
          <DialogHeader>
            <DialogTitle>Chọn Địa Chỉ Giao Hàng</DialogTitle>
          </DialogHeader>

          <div className='max-h-[60vh] space-y-3 overflow-y-auto pr-1'>
            {loadingAddresses ? (
              <div className='flex items-center justify-center py-8'>
                <div className='h-8 w-8 animate-spin rounded-full border-4 border-emerald-700 border-t-transparent' />
              </div>
            ) : allAddresses.length === 0 ? (
              <p className='py-8 text-center text-sm text-slate-500'>
                Bạn chưa có địa chỉ nào. Vui lòng thêm địa chỉ trong phần Quản lý địa chỉ.
              </p>
            ) : (
              allAddresses.map((addr) => (
                <button
                  key={addr.id}
                  onClick={() => handleSelectAddress(addr)}
                  className={`w-full rounded-lg border-2 p-4 text-left transition-all hover:border-emerald-600 hover:bg-emerald-50/50 ${
                    selectedAddress?.id === addr.id
                      ? 'border-emerald-600 bg-emerald-50/50'
                      : 'border-slate-200'
                  }`}
                >
                  <div className='flex items-center gap-2'>
                    <span className='font-semibold text-slate-900'>{addr.recipientName}</span>
                    <span className='text-slate-300'>|</span>
                    <span className='text-sm text-slate-600'>{addr.recipientPhoneNumber}</span>
                    {addr.isDefault && (
                      <span className='rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-semibold text-emerald-700'>
                        Mặc định
                      </span>
                    )}
                  </div>
                  <p className='mt-1 text-sm text-slate-500'>
                    {addr.detail}, {addr.ward}, {addr.province}
                  </p>
                </button>
              ))
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
