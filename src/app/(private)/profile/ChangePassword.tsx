'use client'

import { useState } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Lock, Eye, EyeOff, Save, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { changePasswordAPI } from '~/apiRequests/user.apiRequest'
import { useBoundStore } from '~/zustand/store'

const passwordSchema = z.object({
  currentPassword: z.string().min(1, 'Vui lòng nhập mật khẩu hiện tại'),
  newPassword: z.string().min(6, 'Mật khẩu mới phải có ít nhất 6 ký tự'),
  confirmPassword: z.string().min(1, 'Vui lòng xác nhận mật khẩu'),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: 'Mật khẩu xác nhận không khớp',
  path: ['confirmPassword'],
})

type PasswordFormData = z.infer<typeof passwordSchema>

export default function ChangePassword() {
  const [isLoading, setIsLoading] = useState(false)
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  
  const user = useBoundStore((state) => state.user)

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<PasswordFormData>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    }
  })

  const onSubmitChangePassword = async (data: PasswordFormData) => {
    if (!user) return
    
    setIsLoading(true)
    try {
      const dataToChange = {
        currentPassword: data.currentPassword,
        newPassword: data.newPassword
      }

      await changePasswordAPI(user.id, dataToChange)
      
      toast.success('Đổi mật khẩu thành công!')
      // reset()
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || 'Có lỗi xảy ra khi đổi mật khẩu'
      toast.error(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  // Early return if user not loaded
  if (!user) {
    return (
      <div className='flex h-64 items-center justify-center'>
        <div className='text-muted-foreground'>Đang tải...</div>
      </div>
    )
  }

  return (
    <div className='bg-white rounded-2xl shadow-lg overflow-hidden'>
      {/* Header */}
      <div className='bg-linear-to-r from-[#004643] to-[#005d58] p-8'>
        <h1 className='text-3xl font-bold text-white mb-2'>Đổi Mật Khẩu</h1>
        <p className='text-white/80'>Cập nhật mật khẩu để bảo mật tài khoản</p>
      </div>

      {/* Content */}
      <div className='p-8'>
        <div className='max-w-2xl mx-auto'>
          <form onSubmit={handleSubmit(onSubmitChangePassword)} className='space-y-6'>
            {/* Current Password */}
            <div>
              <label className='block text-sm font-semibold text-gray-700 mb-2'>
                <Lock className='w-4 h-4 inline mr-2 text-[#004643]' />
                Mật khẩu hiện tại
              </label>
              <Controller
                name='currentPassword'
                control={control}
                render={({ field }) => (
                  <div className='relative'>
                    <input
                      {...field}
                      type={showCurrentPassword ? 'text' : 'password'}
                      className='text-gray-900 w-full px-4 py-3 pr-12 border-2 border-gray-200 rounded-lg focus:border-[#004643] focus:outline-none transition-colors'
                      placeholder='Nhập mật khẩu hiện tại'
                      disabled={isLoading}
                    />
                    <button
                      type='button'
                      onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                      className='absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700'
                      disabled={isLoading}
                    >
                      {showCurrentPassword ? <EyeOff className='w-5 h-5' /> : <Eye className='w-5 h-5' />}
                    </button>
                  </div>
                )}
              />
              {errors.currentPassword && (
                <p className='mt-1 text-sm text-red-500'>{errors.currentPassword.message}</p>
              )}
            </div>

            {/* New Password */}
            <div>
              <label className='block text-sm font-semibold text-gray-700 mb-2'>
                <Lock className='w-4 h-4 inline mr-2 text-[#004643]' />
                Mật khẩu mới
              </label>
              <Controller
                name='newPassword'
                control={control}
                render={({ field }) => (
                  <div className='relative'>
                    <input
                      {...field}
                      type={showNewPassword ? 'text' : 'password'}
                      className='text-gray-900 w-full px-4 py-3 pr-12 border-2 border-gray-200 rounded-lg focus:border-[#004643] focus:outline-none transition-colors'
                      placeholder='Nhập mật khẩu mới'
                      disabled={isLoading}
                    />
                    <button
                      type='button'
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className='absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700'
                      disabled={isLoading}
                    >
                      {showNewPassword ? <EyeOff className='w-5 h-5' /> : <Eye className='w-5 h-5' />}
                    </button>
                  </div>
                )}
              />
              {errors.newPassword && (
                <p className='mt-1 text-sm text-red-500'>{errors.newPassword.message}</p>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label className='block text-sm font-semibold text-gray-700 mb-2'>
                <Lock className='w-4 h-4 inline mr-2 text-[#004643]' />
                Xác nhận mật khẩu mới
              </label>
              <Controller
                name='confirmPassword'
                control={control}
                render={({ field }) => (
                  <div className='relative'>
                    <input
                      {...field}
                      type={showConfirmPassword ? 'text' : 'password'}
                      className='text-gray-900 w-full px-4 py-3 pr-12 border-2 border-gray-200 rounded-lg focus:border-[#004643] focus:outline-none transition-colors'
                      placeholder='Nhập lại mật khẩu mới'
                      disabled={isLoading}
                    />
                    <button
                      type='button'
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className='absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700'
                      disabled={isLoading}
                    >
                      {showConfirmPassword ? <EyeOff className='w-5 h-5' /> : <Eye className='w-5 h-5' />}
                    </button>
                  </div>
                )}
              />
              {errors.confirmPassword && (
                <p className='mt-1 text-sm text-red-500'>{errors.confirmPassword.message}</p>
              )}
            </div>

            {/* Submit Button */}
            <div className='flex justify-end pt-6 border-t border-gray-200'>
              <button
                type='submit'
                disabled={isLoading}
                className='bg-linear-to-r from-[#004643] to-[#005d58] hover:from-[#005d58] hover:to-[#004643] text-white px-8 py-3 rounded-lg font-semibold flex items-center gap-2 shadow-lg hover:shadow-xl transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none'
              >
                {isLoading ? (
                  <>
                    <Loader2 className='w-5 h-5 animate-spin' />
                    Đang cập nhật...
                  </>
                ) : (
                  <>
                    <Save className='w-5 h-5' />
                    Đổi mật khẩu
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}