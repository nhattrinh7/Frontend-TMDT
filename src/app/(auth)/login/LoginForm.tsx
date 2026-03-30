'use client'

import type React from 'react'
import { useState } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { GoogleLogin } from '@react-oauth/google'
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
import { googleLoginClientAPI, loginClientAPI } from '~/apiRequests/auth.apiRequest'
import { loginBodySchema, type LoginBodyType } from '~/zodSchema/auth.schema'
import { useBoundStore } from '~/zustand/store'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<'div'>) {
  const [isLoading, setIsLoading] = useState(false)
  const [isAccountLocked, setIsAccountLocked] = useState(false)
  const [error, setError] = useState({
    hasError: false,
    message: '',
  })
  
  const { control, handleSubmit, formState: { errors } } = useForm<LoginBodyType>({
    resolver: zodResolver(loginBodySchema),
    defaultValues: {
      email: '',
      password: '',
    },
  })

  const router = useRouter()
  const setUser = useBoundStore((state) => state.setUser)

  const submitLogin = async (data: LoginBodyType) => {
    if (isAccountLocked) return

    try {
      setIsLoading(true)
      setError({ hasError: false, message: '' })
      setIsAccountLocked(false)

      const response = await loginClientAPI(data)
      localStorage.setItem('accessToken', response.data.accessToken)
      localStorage.setItem('refreshToken', response.data.refreshToken)
      setUser(response.data.user)
      
      if (response) {
        router.push('/')
      } 
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      const message = err?.message || 'Đã có lỗi xảy ra. Vui lòng thử lại sau.'

      // Kiểm tra xem tài khoản có bị khóa không (message từ backend chứa 'khóa tạm thời')
      if (message.includes('khóa tạm thời')) {
        setIsAccountLocked(true)
      }

      setError({ hasError: true, message })
    } finally {
      setIsLoading(false)
    }
  }

  const submitGoogleLogin = async (credential: string) => {
    try {
      setIsLoading(true)
      setError({ hasError: false, message: '' })

      const response = await googleLoginClientAPI({ credential })
      localStorage.setItem('accessToken', response.data.accessToken)
      localStorage.setItem('refreshToken', response.data.refreshToken)
      setUser(response.data.user)
      
      if (response) {
        router.push('/')
      }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      setError({
        hasError: true,
        message: err?.message || 'Đã có lỗi xảy ra. Vui lòng thử lại sau.'
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className={cn('flex flex-col gap-6', className)} {...props}>
      <Card>
        <CardHeader>
          <CardTitle>Đăng nhập</CardTitle>
          <CardDescription>
            Nhập email và mật khẩu để đăng nhập tài khoản
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(submitLogin)}>
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
                      disabled={isAccountLocked}
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
                <div className='flex items-center'>
                  <FieldLabel htmlFor='password'>Mật Khẩu</FieldLabel>

                  <Link
                    href='/forgot-password'
                    className='ml-auto inline-block text-sm underline-offset-4 hover:underline'
                  >
                    Quên mật khẩu?
                  </Link>
                </div>

                <Controller
                  name='password'
                  control={control}
                  render={({ field }) => (
                    <Input
                      {...field}
                      id='password'
                      type='password'
                      disabled={isAccountLocked}
                    />
                  )}
                />
                {errors.password && (
                  <FieldDescription className='text-red-500'>
                    {errors.password.message}
                  </FieldDescription>
                )}
              </Field>
              
              <Field>
                <Button 
                  type='submit' 
                  disabled={isLoading || isAccountLocked}
                  className='w-full'
                >
                  {isLoading ? 'Đang đăng nhập...' : isAccountLocked ? 'Tài khoản đã bị khóa' : 'Đăng nhập'}
                </Button>
                <div className='w-full flex justify-center'>
                  <GoogleLogin
                    onSuccess={(credentialResponse) => {
                      const credential = credentialResponse.credential
                      if (!credential) {
                        setError({
                          hasError: true,
                          message: 'Không nhận được credential từ Google'
                        })
                        return
                      }
                      submitGoogleLogin(credential)
                    }}
                    onError={() => {
                      setError({
                        hasError: true,
                        message: 'Đăng nhập Google thất bại'
                      })
                    }}
                  />
                </div>
                {error.hasError && (
                  <div className={cn(
                    'rounded-md p-3 text-sm',
                    isAccountLocked
                      ? 'bg-red-50 border border-red-200 text-red-700'
                      : 'bg-amber-50 border border-amber-200 text-amber-700'
                  )}>
                    <div className='flex items-start gap-2'>
                      <span className='mt-0.5'>{isAccountLocked ? '🔒' : '⚠️'}</span>
                      <span>{error.message}</span>
                    </div>
                    {isAccountLocked && (
                      <p className='mt-2 text-xs text-red-500'>
                        Bạn có thể <Link href='/forgot-password' className='underline font-medium'>đặt lại mật khẩu</Link> để mở khóa tài khoản ngay.
                      </p>
                    )}
                  </div>
                )}
                <FieldDescription className='text-center'>
                  Chưa có tài khoản?{' '}
                  <Link href='/register' className='underline'>
                    Đăng kí
                  </Link>
                </FieldDescription>
              </Field>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
