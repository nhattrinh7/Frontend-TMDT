'use client'

import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '~/components/ui/dialog'
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from '~/components/ui/input-otp'
import { ShieldCheck, Loader2, AlertCircle } from 'lucide-react'

interface WalletPasscodeDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: (passcode: string) => Promise<void>
  amount: number
}

const formatPrice = (price: number) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price)

export default function WalletPasscodeDialog({
  open,
  onOpenChange,
  onConfirm,
  amount,
}: WalletPasscodeDialogProps) {
  const [passcode, setPasscode] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleChange = (value: string) => {
    setPasscode(value)
    setError(null)
  }

  // Auto-submit khi đủ 6 số
  const handleComplete = (value: string) => {
    setPasscode(value)
    setError(null)
    setTimeout(async () => {
      if (value.length === 6) {
        setIsLoading(true)
        try {
          await onConfirm(value)
        } catch (err) {
          setError(err instanceof Error ? err.message : 'Xác nhận thất bại, vui lòng thử lại')
          setPasscode('')
          setIsLoading(false)
        }
      }
    }, 100)
  }

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!isLoading) onOpenChange(v) }}>
      <DialogContent className='max-w-sm' onPointerDownOutside={(e) => { if (isLoading) e.preventDefault() }}>
        <DialogHeader className='items-center space-y-3'>
          <div className='flex h-14 w-14 items-center justify-center rounded-full bg-emerald-50'>
            <ShieldCheck className='h-7 w-7 text-emerald-600' />
          </div>
          <DialogTitle className='text-center text-lg'>Xác nhận thanh toán</DialogTitle>
          <DialogDescription className='text-center text-sm text-slate-500'>
            Nhập mã passcode ví Szone để thanh toán
          </DialogDescription>
        </DialogHeader>

        {/* Số tiền */}
        <div className='my-2 rounded-lg bg-slate-50 py-3 text-center'>
          <p className='text-xs text-slate-500'>Số tiền thanh toán</p>
          <p className='mt-1 text-2xl font-bold text-emerald-700'>{formatPrice(amount)}</p>
        </div>

        {/* OTP Input */}
        <div className='flex flex-col items-center gap-4 py-2'>
          {isLoading ? (
            <div className='flex flex-col items-center gap-3 py-4'>
              <Loader2 className='h-8 w-8 animate-spin text-emerald-600' />
              <p className='text-sm text-slate-500'>Đang xử lý thanh toán...</p>
            </div>
          ) : (
            <>
              <InputOTP
                maxLength={6}
                value={passcode}
                onChange={handleChange}
                onComplete={handleComplete}
                disabled={isLoading}
              >
                <InputOTPGroup>
                  <InputOTPSlot index={0} className='h-12 w-12 text-lg font-semibold' />
                  <InputOTPSlot index={1} className='h-12 w-12 text-lg font-semibold' />
                  <InputOTPSlot index={2} className='h-12 w-12 text-lg font-semibold' />
                  <InputOTPSlot index={3} className='h-12 w-12 text-lg font-semibold' />
                  <InputOTPSlot index={4} className='h-12 w-12 text-lg font-semibold' />
                  <InputOTPSlot index={5} className='h-12 w-12 text-lg font-semibold' />
                </InputOTPGroup>
              </InputOTP>

              {error && (
                <div className='flex items-center gap-2 text-sm text-red-500'>
                  <AlertCircle className='h-4 w-4 shrink-0' />
                  <span>{error}</span>
                </div>
              )}

              <p className='text-xs text-slate-400'>Nhập 6 số passcode của bạn</p>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
