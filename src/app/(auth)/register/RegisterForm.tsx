'use client'

import type React from 'react'
import { useState } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { cn } from '~/lib/utils'
import { Button } from '~/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '~/components/ui/card'
import { Field, FieldDescription, FieldGroup, FieldLabel } from '~/components/ui/field'
import { Input } from '~/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '~/components/ui/select'
import { RadioGroup, RadioGroupItem } from '~/components/ui/radio-group'
import { Label } from '~/components/ui/label'
import { registerAPI } from '~/apiRequests/auth.apiRequest'
import { registerBodyFormSchema, type RegisterBodyTypeForm } from '~/zodSchema/auth.schema'
import { useRouter } from 'next/navigation'
import Link from 'next/link'


export function RegisterForm({ className, ...props }: React.ComponentProps<'div'>) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterBodyTypeForm>({
    resolver: zodResolver(registerBodyFormSchema),
    defaultValues: {
      name: '',
      email: '',
      phoneNumber: '',
      day: '',
      month: '',
      year: '',
      gender: 'MALE',
      password: '',
      confirmPassword: '',
    },
  })

  const router = useRouter()

  const months = [
    'Tháng 1',
    'Tháng 2',
    'Tháng 3',
    'Tháng 4',
    'Tháng 5',
    'Tháng 6',
    'Tháng 7',
    'Tháng 8',
    'Tháng 9',
    'Tháng 10',
    'Tháng 11',
    'Tháng 12',
  ]

  const submitRegister = async (data: RegisterBodyTypeForm) => {
    try {
      setIsLoading(true)
      setError(null)
      
      const dob = new Date(
        parseInt(data.year),
        parseInt(data.month) - 1,
        parseInt(data.day)
      )
      
      const apiData = {
        fullName: data.name,
        email: data.email,
        phoneNumber: data.phoneNumber,
        dob: dob.toISOString(),
        gender: data.gender as 'MALE' | 'FEMALE' | 'OTHER',
        password: data.password
      }
      
      const res = await registerAPI(apiData)
      if (res) {
        router.push(`/verify-email?email=${res.email}`)
      }  

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Đã xảy ra lỗi'
      setError(errorMessage)
      console.log('Registration error:', errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className={cn('flex flex-col gap-6', className)} {...props}>
      <Card>
        <CardHeader className='text-center'>
          <CardTitle className='text-xl'>Tạo tài khoản của bạn</CardTitle>
          <CardDescription>Nhập thông tin của bạn dưới đây để tạo tài khoản</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(submitRegister)}>
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor='name'>Họ và Tên</FieldLabel>
                <Controller
                  name='name'
                  control={control}
                  render={({ field }) => <Input {...field} id='name' type='text' placeholder='Nguyễn Văn A' />}
                />
                {errors.name && <FieldDescription className='text-red-500'>{errors.name.message}</FieldDescription>}
              </Field>

              <Field>
                <FieldLabel htmlFor='email'>Email</FieldLabel>
                <Controller
                  name='email'
                  control={control}
                  render={({ field }) => <Input {...field} id='email' type='email' placeholder='m@example.com' />}
                />
                {errors.email && <FieldDescription className='text-red-500'>{errors.email.message}</FieldDescription>}
              </Field>

              <Field>
                <FieldLabel htmlFor='phone'>Số Điện Thoại</FieldLabel>
                <Controller
                  name='phoneNumber'
                  control={control}
                  render={({ field }) => <Input {...field} id='phone' type='tel' placeholder='+84 123 456 789' />}
                />
                {errors.phoneNumber && <FieldDescription className='text-red-500'>{errors.phoneNumber.message}</FieldDescription>}
              </Field>

              <Field>
                <FieldLabel>Ngày Sinh</FieldLabel>
                <div className='grid grid-cols-3 gap-2'>
                  <Controller
                    name='day'
                    control={control}
                    render={({ field }) => (
                      <Select value={field.value} onValueChange={field.onChange}>
                        <SelectTrigger id='day'>
                          <SelectValue placeholder='Chọn ngày' />
                        </SelectTrigger>
                        <SelectContent>
                          {Array.from({ length: 31 }, (_, i) => i + 1).map((dayNum) => (
                            <SelectItem key={dayNum} value={dayNum.toString()}>
                              {dayNum.toString().padStart(2, '0')}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                  <Controller
                    name='month'
                    control={control}
                    render={({ field }) => (
                      <Select value={field.value} onValueChange={field.onChange}>
                        <SelectTrigger id='month'>
                          <SelectValue placeholder='Chọn tháng' />
                        </SelectTrigger>
                        <SelectContent>
                          {months.map((monthName, index) => (
                            <SelectItem key={monthName} value={(index + 1).toString()}>
                              {monthName}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                  <Controller
                    name='year'
                    control={control}
                    render={({ field }) => (
                      <Input
                        {...field}
                        id='year'
                        type='number'
                        placeholder='YYYY'
                        min='1900'
                        max={new Date().getFullYear().toString()}
                      />
                    )}
                  />
                </div>
                {(errors.day || errors.month || errors.year) && (
                  <FieldDescription className='text-red-500'>
                    {errors.day?.message || errors.month?.message || errors.year?.message}
                  </FieldDescription>
                )}
              </Field>

              <Field>
                <FieldLabel>Giới Tính</FieldLabel>
                <Controller
                  name='gender'
                  control={control}
                  render={({ field }) => (
                    <RadioGroup value={field.value} onValueChange={field.onChange}>
                      <div className='flex gap-6'>
                        <div className='flex items-center gap-2'>
                          <RadioGroupItem value='MALE' id='gender-male' />
                          <Label htmlFor='gender-male' className='text-sm font-normal cursor-pointer'>
                            Nam
                          </Label>
                        </div>
                        <div className='flex items-center gap-2'>
                          <RadioGroupItem value='FEMALE' id='gender-female' />
                          <Label htmlFor='gender-female' className='text-sm font-normal cursor-pointer'>
                            Nữ
                          </Label>
                        </div>
                        <div className='flex items-center gap-2'>
                          <RadioGroupItem value='OTHER' id='gender-other' />
                          <Label htmlFor='gender-other' className='text-sm font-normal cursor-pointer'>
                            Khác
                          </Label>
                        </div>
                      </div>
                    </RadioGroup>
                  )}
                />
                {errors.gender && <FieldDescription className='text-red-500'>{errors.gender.message}</FieldDescription>}
              </Field>

              <Field>
                <div className='grid grid-cols-2 gap-4'>
                  <Field>
                    <FieldLabel htmlFor='password'>Mật Khẩu</FieldLabel>
                    <Controller
                      name='password'
                      control={control}
                      render={({ field }) => <Input {...field} id='password' type='password' />}
                    />
                    {errors.password && (
                      <FieldDescription className='text-red-500'>{errors.password.message}</FieldDescription>
                    )}
                  </Field>
                  <Field>
                    <FieldLabel htmlFor='confirm-password'>Xác Nhận Mật Khẩu</FieldLabel>
                    <Controller
                      name='confirmPassword'
                      control={control}
                      render={({ field }) => <Input {...field} id='confirm-password' type='password' />}
                    />
                    {errors.confirmPassword && (
                      <FieldDescription className='text-red-500'>{errors.confirmPassword.message}</FieldDescription>
                    )}
                  </Field>
                </div>
                <FieldDescription>Phải có ít nhất 8 ký tự.</FieldDescription>
              </Field>

              <Field>
                <Button type='submit' disabled={isLoading}>
                  {isLoading ? 'Đang tạo...' : 'Tạo Tài Khoản'}
                </Button>
                {error && <FieldDescription className='text-red-500'>{error}</FieldDescription>}
                <FieldDescription className='text-center'>
                  Đã có tài khoản? 
                  <Link href='/login'>Đăng nhập</Link>
                </FieldDescription>
              </Field>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>
      <FieldDescription className='px-6 text-center'>
        Bằng cách nhấp tiếp tục, bạn đồng ý với <a href='#'>Điều Khoản Dịch Vụ</a> và <a href='#'>Chính Sách Bảo Mật</a>{' '}
        của chúng tôi.
      </FieldDescription>
    </div>
  )
}