'use client'

import type React from 'react'
import { useEffect, useState } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { cn } from '~/lib/utils'
import { Button } from '~/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '~/components/ui/card'
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from '~/components/ui/field'
import { Input } from '~/components/ui/input'
import { InputOTP, InputOTPGroup, InputOTPSlot } from '~/components/ui/input-otp'
import { resetPasswordAPI } from '~/apiRequests/auth.apiRequest'
import { resetPasswordBodySchema, type ResetPasswordBodyType } from '~/zodSchema/auth.schema'

const FORGOT_PASSWORD_EMAIL_KEY = 'forgotPasswordEmail'

export function ResetPasswordForm({
  className,
  ...props
}: React.ComponentProps<'div'>) {
  const [isLoading, setIsLoading] = useState(false)
  const [email, setEmail] = useState<string>('')
  const router = useRouter()

  const { control, handleSubmit, formState: { errors } } = useForm<ResetPasswordBodyType>({
    resolver: zodResolver(resetPasswordBodySchema),
    defaultValues: {
      otp: '',
      newPassword: '',
    },
  })

  useEffect(() => {
    const savedEmail = sessionStorage.getItem(FORGOT_PASSWORD_EMAIL_KEY)
    if (savedEmail) {
      setEmail(savedEmail)
    }
  }, [])

  const submitResetPassword = async (data: ResetPasswordBodyType) => {
    if (!email) {
      toast.error('Không tìm thấy email. Vui lòng yêu cầu OTP trước.')
      return
    }

    try {
      setIsLoading(true)
      await resetPasswordAPI({ email, ...data })
      sessionStorage.removeItem(FORGOT_PASSWORD_EMAIL_KEY)
      toast.success('Đặt lại mật khẩu thành công, vui lòng đăng nhập lại')
      router.push('/login')
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      toast.error(error?.message || 'Không thể đặt lại mật khẩu, vui lòng thử lại')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className={cn('flex flex-col gap-6', className)} {...props}>
      <Card>
        <CardHeader>
          <CardTitle>Nhập OTP</CardTitle>
          <CardDescription>
            Nhập OTP đã gửi tới email của bạn và tạo mật khẩu mới
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!email && (
            <FieldDescription className='mb-4 text-red-500'>
              Không tìm thấy email. Vui lòng quay lại trang quên mật khẩu để gửi OTP.
            </FieldDescription>
          )}

          <form onSubmit={handleSubmit(submitResetPassword)}>
            <FieldGroup>
              <Field>
                <FieldLabel>OTP</FieldLabel>
                <Controller
                  name='otp'
                  control={control}
                  render={({ field }) => (
                    <InputOTP maxLength={6} {...field}>
                      <InputOTPGroup>
                        {[0, 1, 2, 3, 4, 5].map((index) => (
                          <InputOTPSlot key={index} index={index} />
                        ))}
                      </InputOTPGroup>
                    </InputOTP>
                  )}
                />
                {errors.otp && (
                  <FieldDescription className='text-red-500'>
                    {errors.otp.message}
                  </FieldDescription>
                )}
              </Field>

              <Field>
                <FieldLabel htmlFor='newPassword'>Mật khẩu mới</FieldLabel>
                <Controller
                  name='newPassword'
                  control={control}
                  render={({ field }) => (
                    <Input
                      {...field}
                      id='newPassword'
                      type='password'
                    />
                  )}
                />
                {errors.newPassword && (
                  <FieldDescription className='text-red-500'>
                    {errors.newPassword.message}
                  </FieldDescription>
                )}
              </Field>

              <Field>
                <Button
                  type='submit'
                  disabled={isLoading || !email}
                  className='w-full'
                >
                  {isLoading ? 'Đang xác nhận...' : 'Đặt lại mật khẩu'}
                </Button>
              </Field>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
