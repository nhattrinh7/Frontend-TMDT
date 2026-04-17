import { Suspense } from 'react'
import { VerifyEmailForm }from '~/app/(auth)/verify-email/VerifyEmailForm'

function VerifyEmailLoading() {
  return (
    <div className='flex items-center justify-center'>
      <div className='text-muted-foreground'>Đang tải...</div>
    </div>
  )
}

export default function VerifyEmailPage() {
  return (
    <div className='bg-background flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10'>
      <div className='w-full max-w-sm'>
        <Suspense fallback={<VerifyEmailLoading />}>
          <VerifyEmailForm />
        </Suspense>
      </div>
    </div>
  )
}

