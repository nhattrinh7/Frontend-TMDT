/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

import type React from 'react'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { GalleryVerticalEnd } from 'lucide-react'
import { verifyEmailAPI } from '~/apiRequests/auth.apiRequest'
import { cn } from '~/lib/utils'
import { Button } from '~/components/ui/button'
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '~/components/ui/form'
import { Field, FieldDescription, FieldGroup } from '~/components/ui/field'
import { InputOTP, InputOTPGroup, InputOTPSlot } from '~/components/ui/input-otp'
import { useSearchParams } from 'next/navigation'

import { useRouter } from 'next/navigation'

export function VerifyEmailForm({ className, ...props }: React.ComponentProps<'div'>) {
  const [isLoading, setIsLoading] = useState(false)

  const form = useForm<any>({
    // resolver: zodResolver(verifyEmailSchema),
    defaultValues: {
      otp: '',
    },
  })

  const router = useRouter()
  const searchParams = useSearchParams()
  const email = searchParams.get('email')

  async function onSubmit(data: any) {
    setIsLoading(true)
    try {
      await verifyEmailAPI({ email: email!, otp: data.otp })
      router.push('/login')
    } catch(error) {
      console.log('error', error)
    }finally {
      setIsLoading(false)
    }
  }

  return (
    <div className={cn('flex flex-col gap-6', className)} {...props}>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <FieldGroup>
            <div className='flex flex-col items-center gap-2 text-center'>
              <a href='#' className='flex flex-col items-center gap-2 font-medium'>
                <div className='flex size-8 items-center justify-center rounded-md'>
                  <GalleryVerticalEnd className='size-6' />
                </div>
                <span className='sr-only'>Acme Inc.</span>
              </a>
              <h1 className='text-xl font-bold'>Verify Your Email</h1>
              <FieldDescription>We&apos;ve sent a 6-digit code to your email address</FieldDescription>
            </div>

            <FormField
              control={form.control}
              name='otp'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Enter OTP</FormLabel>
                  <FormControl>
                    <InputOTP maxLength={6} {...field}>
                      <InputOTPGroup>
                        {[0, 1, 2, 3, 4, 5].map((index) => (
                          <InputOTPSlot key={index} index={index} />
                        ))}
                      </InputOTPGroup>
                    </InputOTP>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Field>
              <Button type='submit' disabled={isLoading}>
                {isLoading ? 'Verifying...' : 'Verify Email'}
              </Button>
            </Field>

            <div className='text-center'>
              <FieldDescription>
                Didn&apos;t receive the code?{' '}
                <a href='#' className='text-primary hover:underline'>
                  Resend OTP
                </a>
              </FieldDescription>
            </div>
          </FieldGroup>
        </form>
      </Form>

      <FieldDescription className='px-6 text-center'>
        By verifying your email, you agree to our <a href='#'>Terms of Service</a> and <a href='#'>Privacy Policy</a>.
      </FieldDescription>
    </div>
  )
}
