'use client'

import type React from 'react'
import { useState } from 'react'
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
import { forgotPasswordAPI } from '~/apiRequests/auth.apiRequest'
import { forgotPasswordBodySchema, type ForgotPasswordBodyType } from '~/zodSchema/auth.schema'

const FORGOT_PASSWORD_EMAIL_KEY = 'forgotPasswordEmail'

export function ForgotPasswordForm({
  className,
  ...props
}: React.ComponentProps<'div'>) {
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const { control, handleSubmit, formState: { errors } } = useForm<ForgotPasswordBodyType>({
    resolver: zodResolver(forgotPasswordBodySchema),
    defaultValues: {
      email: '',
    },
  })

  const submitForgotPassword = async (data: ForgotPasswordBodyType) => {
    try {
      setIsLoading(true)
      await forgotPasswordAPI(data)
      sessionStorage.setItem(FORGOT_PASSWORD_EMAIL_KEY, data.email)
      toast.success('Đã gửi OTP, vui lòng kiểm tra email của bạn')
      router.push('/reset-password')
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      toast.error(error?.message || 'Không thể gửi OTP, vui lòng thử lại')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className={cn('flex flex-col gap-6', className)} {...props}>
      <Card>
        <CardHeader>
          <CardTitle>Quên mật khẩu</CardTitle>
          <CardDescription>
            Nhập email để nhận mã OTP đặt lại mật khẩu
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(submitForgotPassword)}>
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor='email'>Email</FieldLabel>
                <Controller
                  name='email'
                  control={control}
                  render={({ field }) => (
                    <Input
                      {...field}
                      id='email'
                      type='email'
                      placeholder='m@example.com'
                    />
                  )}
                />
                {errors.email && (
                  <FieldDescription className='text-red-500'>
                    {errors.email.message}
                  </FieldDescription>
                )}
              </Field>

              <Field>
                <Button
                  type='submit'
                  disabled={isLoading}
                  className='w-full'
                >
                  {isLoading ? 'Đang gửi...' : 'Gửi OTP'}
                </Button>
              </Field>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
