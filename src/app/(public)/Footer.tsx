import Image from 'next/image'

export default function Footer() {
  return (
    <footer className='border-t border-[#004643]/15 bg-linear-to-b from-white to-[#f3fbf9]'>
      <div className='mx-auto w-full max-w-400 px-4 lg:px-6 py-10'>
        <div className='mb-8 h-1 w-12 rounded-full bg-[#004643]'></div>
        <div className='grid grid-cols-2 gap-8 md:grid-cols-4'>
          <div className='space-y-4'>
            <h3 className='text-sm font-bold uppercase tracking-wide text-[#004643]'>
              Dịch vụ khách hàng
            </h3>
            <div className='space-y-2 text-sm text-gray-600'>
              <p>Trung Tâm Trợ Giúp Szone</p>
              <p>Blog Szone</p>
              <p>Szone Mall</p>
              <p>Hướng Dẫn Mua Hàng/Đặt Hàng</p>
              <p>Hướng Dẫn Bán Hàng</p>
              <p>Ví SzonePay</p>
              <p>Szone Xu</p>
              <p>Đơn Hàng</p>
              <p>Trả Hàng/Hoàn Tiền</p>
              <p>Liên Hệ Szone</p>
              <p>Chính Sách Bảo Hành</p>
            </div>
          </div>

          <div className='space-y-4'>
            <h3 className='text-sm font-bold uppercase tracking-wide text-[#004643]'>
              Szone Việt Nam
            </h3>
            <div className='space-y-2 text-sm text-gray-600'>
              <p>Về Szone</p>
              <p>Tuyển Dụng</p>
              <p>Điều Khoản Szone</p>
              <p>Chính Sách Bảo Mật</p>
              <p>Szone Mall</p>
              <p>Kênh Người Bán</p>
              <p>Flash Sale</p>
              <p>Tiếp Thị Liên Kết</p>
              <p>Liên Hệ Truyền Thông</p>
            </div>
          </div>

          <div className='space-y-4'>
            <h3 className='text-sm font-bold uppercase tracking-wide text-[#004643]'>
              Thanh toán
            </h3>
            <div className='grid grid-cols-3 gap-2'>
              <div className='flex h-10 items-center justify-center rounded border border-[#004643]/25 bg-white p-1'>
                <div className='relative h-full w-full'>
                  <Image
                    src='/images/footer-logos/sepay.png'
                    alt='SePay'
                    fill
                    className='object-contain'
                  />
                </div>
              </div>
              <div className='flex h-10 items-center justify-center rounded border border-[#004643]/25 bg-white text-xs font-semibold text-[#004643]'>
                COD
              </div>
              <div className='flex h-10 items-center justify-center rounded border border-[#004643]/25 bg-white text-xs font-semibold text-[#004643]'>
                Wallet
              </div>
            </div>

            <div className='space-y-3 pt-4'>
              <h4 className='text-sm font-bold uppercase tracking-wide text-[#004643]'>
                Đơn vị vận chuyển
              </h4>
              <div className='grid grid-cols-3 gap-2 text-xs font-semibold text-gray-700'>
                <div className='flex h-9 items-center justify-center rounded border border-[#004643]/20 bg-white p-1'>
                  <div className='relative h-full w-full'>
                    <Image
                      src='/images/footer-logos/giao-hang-nhanh.png'
                      alt='Giao Hàng Nhanh'
                      fill
                      className='object-contain'
                    />
                  </div>
                </div>
                <div className='flex h-9 items-center justify-center rounded border border-[#004643]/20 bg-white p-1'>
                  <div className='relative h-full w-full'>
                    <Image
                      src='/images/footer-logos/viettelpost.png'
                      alt='Viettel Post'
                      fill
                      className='object-contain'
                    />
                  </div>
                </div>
                <div className='flex h-9 items-center justify-center rounded border border-[#004643]/20 bg-white p-1'>
                  <div className='relative h-full w-full'>
                    <Image
                      src='/images/footer-logos/J&T.png'
                      alt='J&T Express'
                      fill
                      className='object-contain'
                    />
                  </div>
                </div>
                <div className='flex h-9 items-center justify-center rounded border border-[#004643]/20 bg-white p-1'>
                  <div className='relative h-full w-full'>
                    <Image
                      src='/images/footer-logos/grabexpress.jpg'
                      alt='GrabExpress'
                      fill
                      className='object-contain'
                    />
                  </div>
                </div>
                <div className='flex h-9 items-center justify-center rounded border border-[#004643]/20 bg-white p-1'>
                  <div className='relative h-full w-full'>
                    <Image
                      src='/images/footer-logos/ninja-van.jpg'
                      alt='Ninja Van'
                      fill
                      className='object-contain'
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className='space-y-4'>
            <h3 className='text-sm font-bold uppercase tracking-wide text-[#004643]'>
              Theo dõi Szone
            </h3>
            <div className='space-y-2 text-sm text-gray-600'>
              <p>Facebook</p>
              <p>Instagram</p>
              <p>LinkedIn</p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
