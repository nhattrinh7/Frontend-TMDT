import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Giới thiệu | Szone',
  description: 'Trang giới thiệu nền tảng TMĐT Szone.',
}

export default function LandingPage() {
  return (
    <main className='min-h-screen bg-gray-50'>
      {/* Hero */}
      <section className='relative overflow-hidden bg-linear-to-r from-[#004643] to-[#005d58]'>
        <div className='pointer-events-none absolute inset-0 opacity-25'>
          <div className='absolute -top-32 -left-32 h-96 w-96 rounded-full bg-white/20 blur-3xl' />
          <div className='absolute -bottom-40 -right-40 h-[28rem] w-[28rem] rounded-full bg-[#FF6B35]/35 blur-3xl' />
        </div>

        <div className='relative mx-auto w-full max-w-400 px-4 lg:px-6 py-12 lg:py-16'>
          <div className='grid grid-cols-1 gap-10 lg:grid-cols-12 lg:items-center'>
            <div className='lg:col-span-7'>
              <div className='inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-white ring-1 ring-white/15'>
                <span className='h-1.5 w-1.5 rounded-full bg-[#ABD1C6]' />
                Nền tảng TMĐT cho người mua và người bán
              </div>

              <h1 className='mt-4 text-3xl md:text-4xl lg:text-5xl font-extrabold tracking-tight text-white'>
                Mua sắm nhanh hơn. Bán hàng dễ hơn.
              </h1>

              <p className='mt-4 text-base md:text-lg leading-7 text-white/85 max-w-2xl'>
                Szone giúp bạn tìm sản phẩm phù hợp, theo dõi đơn hàng rõ ràng và kết nối với người bán ngay trong hệ thống.
                Dành cho người bán: quản lý sản phẩm, đơn hàng và doanh thu trong một nơi.
              </p>

              <div className='mt-7 flex flex-col sm:flex-row gap-3'>
                <Link
                  href='/'
                  className='inline-flex items-center justify-center rounded-xl bg-white px-5 py-3 text-sm font-bold text-[#004643] shadow-sm hover:bg-white/95'
                >
                  Bắt đầu mua sắm
                </Link>
                <Link
                  href='/register'
                  className='inline-flex items-center justify-center rounded-xl bg-linear-to-r from-[#FF6B35] to-[#FF5722] px-5 py-3 text-sm font-bold text-white shadow-sm hover:from-[#FF5722] hover:to-[#FF4500]'
                >
                  Tạo tài khoản
                </Link>
                <Link
                  href='/login'
                  className='inline-flex items-center justify-center rounded-xl bg-white/10 px-5 py-3 text-sm font-bold text-white ring-1 ring-white/20 hover:bg-white/15'
                >
                  Đăng nhập
                </Link>
              </div>

              <div className='mt-8 grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm'>
                <div className='rounded-xl bg-white/8 p-4 ring-1 ring-white/15 text-white/85'>
                  <div className='text-white font-extrabold'>Tìm kiếm</div>
                  <div className='mt-1'>Bộ lọc giá, đánh giá, sắp xếp.</div>
                </div>
                <div className='rounded-xl bg-white/8 p-4 ring-1 ring-white/15 text-white/85'>
                  <div className='text-white font-extrabold'>Giỏ hàng</div>
                  <div className='mt-1'>Quản lý sản phẩm theo shop.</div>
                </div>
                <div className='rounded-xl bg-white/8 p-4 ring-1 ring-white/15 text-white/85'>
                  <div className='text-white font-extrabold'>Hỗ trợ</div>
                  <div className='mt-1'>Chat nhanh với người bán.</div>
                </div>
              </div>
            </div>

            <div className='lg:col-span-5'>
              <div className='rounded-3xl bg-white p-5 shadow-xl ring-1 ring-black/5'>
                <div className='flex items-center justify-between'>
                  <div className='flex items-center gap-3'>
                    <div className='relative h-12 w-12 rounded-xl bg-[#f3fbf9] ring-1 ring-[#004643]/10'>
                      <Image
                        src='/images/logo_4x.png'
                        alt='Szone'
                        fill
                        className='object-contain p-2'
                        priority
                      />
                    </div>
                    <div>
                      <div className='text-base font-extrabold text-gray-900'>Szone</div>
                      <div className='text-xs font-semibold text-gray-500'>Nền tảng TMĐT</div>
                    </div>
                  </div>
                  <div className='rounded-full bg-[#004643]/10 px-3 py-1 text-xs font-bold text-[#004643]'>
                    Public
                  </div>
                </div>

                <div className='mt-5 space-y-3'>
                  <div className='rounded-2xl bg-gray-50 p-4 ring-1 ring-gray-200'>
                    <div className='text-xs font-bold text-gray-500'>Trải nghiệm</div>
                    <div className='mt-1 text-sm font-semibold text-gray-900'>
                      Gợi ý sản phẩm hôm nay, tìm kiếm nhanh, và mua sắm mượt trên mobile.
                    </div>
                  </div>
                  <div className='rounded-2xl bg-gray-50 p-4 ring-1 ring-gray-200'>
                    <div className='text-xs font-bold text-gray-500'>Người bán</div>
                    <div className='mt-1 text-sm font-semibold text-gray-900'>
                      Tạo gian hàng, quản lý sản phẩm, theo dõi đơn hàng.
                    </div>
                  </div>
                  <div className='rounded-2xl bg-gray-50 p-4 ring-1 ring-gray-200'>
                    <div className='text-xs font-bold text-gray-500'>Chính sách</div>
                    <div className='mt-2 flex flex-wrap gap-2'>
                      <Link
                        href='/privacy-policy'
                        className='rounded-lg bg-white px-3 py-1.5 text-xs font-bold text-[#004643] ring-1 ring-gray-200 hover:bg-gray-50'
                      >
                        Privacy Policy
                      </Link>
                      <Link
                        href='/terms-of-service'
                        className='rounded-lg bg-white px-3 py-1.5 text-xs font-bold text-[#004643] ring-1 ring-gray-200 hover:bg-gray-50'
                      >
                        Terms of Service
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Value props */}
      <section className='mx-auto w-full max-w-400 px-4 lg:px-6 py-10 lg:py-14'>
        <div className='grid grid-cols-1 gap-4 lg:grid-cols-3'>
          <div className='rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-200'>
            <div className='text-xs font-bold tracking-wide text-gray-500'>MUA SẮM</div>
            <div className='mt-2 text-lg font-extrabold text-gray-900'>Tìm nhanh, chọn đúng</div>
            <p className='mt-2 text-sm leading-7 text-gray-700'>
              Bộ lọc linh hoạt, trải nghiệm nhẹ, giúp bạn chốt nhanh sản phẩm phù hợp với nhu cầu.
            </p>
            <div className='mt-4'>
              <Link href='/search?search=' className='text-sm font-bold text-[#004643] underline underline-offset-4 decoration-[#004643]/30'>
                Đi đến trang tìm kiếm
              </Link>
            </div>
          </div>

          <div className='rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-200'>
            <div className='text-xs font-bold tracking-wide text-gray-500'>BÁN HÀNG</div>
            <div className='mt-2 text-lg font-extrabold text-gray-900'>Mở shop trong vài bước</div>
            <p className='mt-2 text-sm leading-7 text-gray-700'>
              Đăng ký bán hàng, quản lý sản phẩm và theo dõi đơn hàng theo quy trình rõ ràng.
            </p>
            <div className='mt-4'>
              <Link href='/create-shop' className='text-sm font-bold text-[#004643] underline underline-offset-4 decoration-[#004643]/30'>
                Đăng ký bán hàng
              </Link>
            </div>
          </div>

          <div className='rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-200'>
            <div className='text-xs font-bold tracking-wide text-gray-500'>TIN CẬY</div>
            <div className='mt-2 text-lg font-extrabold text-gray-900'>Minh bạch và an toàn</div>
            <p className='mt-2 text-sm leading-7 text-gray-700'>
              Quy định rõ ràng về quyền riêng tư, điều khoản sử dụng và các hành vi bị cấm trên nền tảng.
            </p>
            <div className='mt-4 flex flex-wrap gap-3'>
              <Link href='/privacy-policy' className='text-sm font-bold text-[#004643] underline underline-offset-4 decoration-[#004643]/30'>
                Chính sách quyền riêng tư
              </Link>
              <Link href='/terms-of-service' className='text-sm font-bold text-[#004643] underline underline-offset-4 decoration-[#004643]/30'>
                Điều khoản dịch vụ
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className='mx-auto w-full max-w-400 px-4 lg:px-6 pb-12'>
        <div className='rounded-3xl bg-linear-to-r from-[#f3fbf9] to-white p-6 lg:p-10 ring-1 ring-[#004643]/10'>
          <div className='flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between'>
            <div>
              <div className='text-xs font-extrabold tracking-wide text-[#004643]'>SZONE</div>
              <h2 className='mt-2 text-2xl lg:text-3xl font-extrabold tracking-tight text-gray-900'>
                Sẵn sàng trải nghiệm?
              </h2>
              <p className='mt-2 text-sm leading-7 text-gray-700 max-w-2xl'>
                Tạo tài khoản để lưu giỏ hàng, theo dõi đơn hàng và bắt đầu bán hàng nếu bạn muốn mở shop.
              </p>
            </div>
            <div className='flex flex-col sm:flex-row gap-3'>
              <Link
                href='/register'
                className='inline-flex items-center justify-center rounded-xl bg-linear-to-r from-[#FF6B35] to-[#FF5722] px-5 py-3 text-sm font-bold text-white shadow-sm hover:from-[#FF5722] hover:to-[#FF4500]'
              >
                Đăng ký ngay
              </Link>
              <Link
                href='/'
                className='inline-flex items-center justify-center rounded-xl bg-white px-5 py-3 text-sm font-bold text-[#004643] ring-1 ring-gray-200 hover:bg-gray-50'
              >
                Xem sản phẩm
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}

