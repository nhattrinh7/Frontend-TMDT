'use client'

import { useState, useEffect, useCallback } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '~/components/ui/dialog'
import { QrCode, Clock, Copy, Check } from 'lucide-react'

interface QRCodeDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  qrUrl: string
  amount: number
}

const formatPrice = (price: number) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price)

const TIMEOUT_SECONDS = 15 * 60 // 15 phút

export default function QRCodeDialog({
  open,
  onOpenChange,
  qrUrl,
  amount,
}: QRCodeDialogProps) {
  const [timeLeft, setTimeLeft] = useState(TIMEOUT_SECONDS)
  const [copied, setCopied] = useState(false)

  // Countdown timer
  useEffect(() => {
    if (!open) {
      setTimeLeft(TIMEOUT_SECONDS)
      return
    }

    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval)
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(interval)
  }, [open])

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60)
    const s = seconds % 60
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
  }

  const handleCopyAmount = useCallback(() => {
    navigator.clipboard.writeText(amount.toString())
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }, [amount])

  // Parse nội dung chuyển khoản từ QR URL
  const transferContent = (() => {
    try {
      const url = new URL(qrUrl)
      return url.searchParams.get('des') || ''
    } catch {
      return ''
    }
  })()

  const isExpired = timeLeft === 0

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className='max-w-md'
        onPointerDownOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        <DialogHeader className='items-center space-y-2'>
          <div className='flex h-12 w-12 items-center justify-center rounded-full bg-blue-50'>
            <QrCode className='h-6 w-6 text-blue-600' />
          </div>
          <DialogTitle className='text-center text-lg'>Quét mã QR để thanh toán</DialogTitle>
          <DialogDescription className='text-center text-sm text-slate-500'>
            Sử dụng ứng dụng ngân hàng để quét mã QR bên dưới
          </DialogDescription>
        </DialogHeader>

        {/* Countdown */}
        <div className={`flex items-center justify-center gap-2 rounded-lg py-2 text-sm font-medium ${
          isExpired
            ? 'bg-red-50 text-red-600'
            : timeLeft <= 120
              ? 'bg-amber-50 text-amber-600'
              : 'bg-slate-50 text-slate-600'
        }`}>
          <Clock className='h-4 w-4' />
          {isExpired ? (
            <span>Đã hết thời gian thanh toán</span>
          ) : (
            <span>Thời gian còn lại: <span className='font-bold'>{formatTime(timeLeft)}</span></span>
          )}
        </div>

        {/* QR Code Image */}
        {!isExpired && (
          <div className='flex flex-col items-center gap-4'>
            <div className='rounded-xl border-2 border-slate-100 bg-white p-3 shadow-sm'>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={qrUrl}
                alt='QR Code thanh toán'
                className='h-52 w-52 object-contain'
              />
            </div>

            {/* Thông tin chuyển khoản */}
            <div className='w-full space-y-2 rounded-lg bg-slate-50 p-4'>
              <div className='flex items-center justify-between text-sm'>
                <span className='text-slate-500'>Số tiền</span>
                <div className='flex items-center gap-2'>
                  <span className='font-bold text-emerald-700'>{formatPrice(amount)}</span>
                  <button
                    onClick={handleCopyAmount}
                    className='rounded p-1 text-slate-400 transition-colors hover:bg-slate-200 hover:text-slate-600'
                    title='Sao chép số tiền'
                  >
                    {copied ? (
                      <Check className='h-3.5 w-3.5 text-emerald-500' />
                    ) : (
                      <Copy className='h-3.5 w-3.5' />
                    )}
                  </button>
                </div>
              </div>
              <div className='flex items-center justify-between text-sm'>
                <span className='text-slate-500'>Nội dung CK</span>
                <span className='font-mono font-semibold text-slate-800'>{transferContent}</span>
              </div>
              <div className='flex items-center justify-between text-sm'>
                <span className='text-slate-500'>Ngân hàng</span>
                <span className='font-semibold text-slate-800'>MBBank</span>
              </div>
            </div>

            <p className='text-center text-xs text-slate-400'>
              Sau khi chuyển khoản thành công, hệ thống sẽ tự động xác nhận thanh toán
            </p>
          </div>
        )}

        {/* Expired state */}
        {isExpired && (
          <div className='flex flex-col items-center gap-3 py-6'>
            <div className='flex h-16 w-16 items-center justify-center rounded-full bg-red-50'>
              <Clock className='h-8 w-8 text-red-400' />
            </div>
            <p className='text-sm text-slate-500'>Giao dịch đã hết hạn. Vui lòng đặt hàng lại.</p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
