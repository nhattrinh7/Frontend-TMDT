'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { reportReviewAPI } from '~/apiRequests/product.apiRequest'

const REPORT_REASONS = [
  { label: 'Đánh giá thô tục phản cảm', value: 'VULGAR' },
  { label: 'Chứa hình ảnh phản cảm, khoả thân, khiêu dâm', value: 'ADULT_CONTENT' },
  { label: 'Đánh giá trùng lặp (thông tin rác)', value: 'SPAM' },
  { label: 'Chứa thông tin cá nhân', value: 'PERSONAL_INFO' },
  { label: 'Quảng cáo trái phép', value: 'ILLEGAL_ADVERTISING' },
  { label: 'Đánh giá không chính xác / gây hiểu lầm (ví dụ như: đánh giá và sản phẩm không khớp, ...)', value: 'FALSE_INFORMATION' },
  { label: 'Vi phạm khác', value: 'OTHER' },
] as const

interface ReportReviewModalProps {
  reviewId: string
  onClose: () => void
}

export function ReportReviewModal({ reviewId, onClose }: ReportReviewModalProps) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null)
  const [description, setDescription] = useState('')
  const [loading, setLoading] = useState(false)

  const selectedReason = selectedIndex !== null ? REPORT_REASONS[selectedIndex] : null
  const isOther = selectedReason?.value === 'OTHER'
  const canSubmit = selectedReason && (!isOther || description.trim().length > 0)

  const handleSubmit = async () => {
    if (!selectedReason || !canSubmit) return

    setLoading(true)
    try {
      await reportReviewAPI(reviewId, {
        reason: selectedReason.value,
        description: isOther ? description.trim() : undefined,
      })
      toast.success('Đã gửi báo cáo thành công')
      onClose()
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      if (error?.statusCode === 409 || error?.message?.includes('Unique constraint')) {
        toast.error('Bạn đã báo cáo đánh giá này rồi')
      } else {
        toast.error('Gửi báo cáo thất bại, vui lòng thử lại')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50' onClick={onClose}>
      <div
        className='w-full max-w-md rounded-lg bg-white p-6 shadow-xl'
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className='text-lg font-semibold text-gray-900'>Báo Cáo Đánh Giá Này</h3>
        <p className='mt-1 text-sm text-gray-500'>Vui lòng chọn lý do báo cáo</p>

        <div className='mt-4 space-y-3'>
          {REPORT_REASONS.map((reason, index) => (
            <label
              key={index}
              className='flex cursor-pointer items-start gap-3'
              onClick={() => setSelectedIndex(index)}
            >
              <div className='mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 border-gray-300'>
                {selectedIndex === index && (
                  <div className='h-3 w-3 rounded-full bg-orange-500' />
                )}
              </div>
              <span className='text-sm text-gray-700'>{reason.label}</span>
            </label>
          ))}
        </div>

        {/* Ô nhập mô tả khi chọn "Vi phạm khác" */}
        {isOther && (
          <div className='mt-3'>
            <input
              type='text'
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder='Mô tả lỗi vi phạm...'
              className='w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500'
            />
          </div>
        )}

        {/* Buttons */}
        <div className='mt-6 flex items-center justify-end gap-3'>
          <button
            onClick={onClose}
            className='px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-800'
            disabled={loading}
          >
            HỦY
          </button>
          <button
            onClick={handleSubmit}
            disabled={!canSubmit || loading}
            className='rounded-md bg-orange-500 px-6 py-2 text-sm font-medium text-white hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-50'
          >
            {loading ? 'Đang gửi...' : 'Gửi'}
          </button>
        </div>
      </div>
    </div>
  )
}
