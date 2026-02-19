'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Star, TrendingUp, Flame, ShoppingCart, Eye } from 'lucide-react'

// Mock data
const bannerData = {
  title: 'Khuyến Mãi Lớn Cuối Năm',
  subtitle: 'Giảm giá đến 50% cho tất cả sản phẩm',
  image: 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=1200&h=400&fit=crop',
}

const featuredProducts = [
  {
    id: 1,
    name: 'iPhone 15 Pro Max 256GB',
    price: 29990000,
    originalPrice: 34990000,
    image: 'https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?w=400&h=400&fit=crop',
    rating: 4.8,
    sold: 1234,
    discount: 14,
  },
  {
    id: 2,
    name: 'Samsung Galaxy S24 Ultra',
    price: 27990000,
    originalPrice: 32990000,
    image: 'https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=400&h=400&fit=crop',
    rating: 4.9,
    sold: 892,
    discount: 15,
  },
  {
    id: 3,
    name: 'MacBook Air M2 13 inch',
    price: 24990000,
    originalPrice: 28990000,
    image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=400&h=400&fit=crop',
    rating: 4.7,
    sold: 567,
    discount: 14,
  },
  {
    id: 4,
    name: 'Sony WH-1000XM5 Headphones',
    price: 7490000,
    originalPrice: 8990000,
    image: 'https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=400&h=400&fit=crop',
    rating: 4.9,
    sold: 2341,
    discount: 17,
  },
  {
    id: 5,
    name: 'iPad Pro 11 inch M2',
    price: 19990000,
    originalPrice: 23990000,
    image: 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=400&h=400&fit=crop',
    rating: 4.8,
    sold: 445,
    discount: 17,
  },
]

const bestSellingProducts = [
  {
    id: 6,
    name: 'AirPods Pro Gen 2',
    price: 5490000,
    originalPrice: 6490000,
    image: 'https://images.unsplash.com/photo-1606841837239-c5a1a4a07af7?w=400&h=400&fit=crop',
    rating: 4.9,
    sold: 5678,
  },
  {
    id: 7,
    name: 'Apple Watch Series 9',
    price: 9990000,
    originalPrice: 11990000,
    image: 'https://images.unsplash.com/photo-1434493789847-2f02dc6ca35d?w=400&h=400&fit=crop',
    rating: 4.7,
    sold: 3421,
  },
  {
    id: 8,
    name: 'Samsung Galaxy Watch 6',
    price: 6990000,
    originalPrice: 8490000,
    image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&h=400&fit=crop',
    rating: 4.6,
    sold: 2987,
  },
  {
    id: 9,
    name: 'Xiaomi 13T Pro 5G',
    price: 11990000,
    originalPrice: 14990000,
    image: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400&h=400&fit=crop',
    rating: 4.5,
    sold: 2156,
  },
  {
    id: 10,
    name: 'Dell XPS 13 Plus',
    price: 32990000,
    originalPrice: 37990000,
    image: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=400&h=400&fit=crop',
    rating: 4.8,
    sold: 1876,
  },
  {
    id: 11,
    name: 'Canon EOS R6 Mark II',
    price: 54990000,
    originalPrice: 62990000,
    image: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=400&h=400&fit=crop',
    rating: 4.9,
    sold: 876,
  },
  {
    id: 12,
    name: 'LG OLED C3 55 inch',
    price: 24990000,
    originalPrice: 29990000,
    image: 'https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=400&h=400&fit=crop',
    rating: 4.8,
    sold: 1543,
  },
  {
    id: 13,
    name: 'Dyson V15 Detect',
    price: 18990000,
    originalPrice: 21990000,
    image: 'https://images.unsplash.com/photo-1558317374-067fb5f30001?w=400&h=400&fit=crop',
    rating: 4.7,
    sold: 2234,
  },
]

export default function HomePage() {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(price)
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const ProductCard = ({ product, showDiscount = false }: any) => (
    <Link href={`/products/${product.id}`}>
      <div className='bg-white rounded-lg shadow-md hover:shadow-2xl transition-all duration-300 overflow-hidden group cursor-pointer h-full flex flex-col'>
        {/* Image */}
        <div className='relative aspect-square overflow-hidden bg-gray-100'>
          <Image
            src={product.image}
            alt={product.name}
            fill
            className='object-cover group-hover:scale-110 transition-transform duration-500'
          />
          {showDiscount && product.discount && (
            <div className='absolute top-2 left-2 bg-gradient-to-r from-red-500 to-red-600 text-white px-3 py-1 rounded-full text-sm font-bold shadow-lg'>
              -{product.discount}%
            </div>
          )}
          <div className='absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity'>
            <button className='bg-white p-2 rounded-full shadow-lg hover:bg-[#004643] hover:text-white transition-colors'>
              <Eye className='w-5 h-5' />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className='p-4 flex-1 flex flex-col'>
          <h3 className='font-semibold text-gray-800 mb-2 line-clamp-2 group-hover:text-[#004643] transition-colors min-h-[48px]'>
            {product.name}
          </h3>

          {/* Rating */}
          <div className='flex items-center gap-2 mb-3'>
            <div className='flex items-center gap-1'>
              <Star className='w-4 h-4 fill-yellow-400 text-yellow-400' />
              <span className='text-sm font-semibold text-gray-700'>{product.rating}</span>
            </div>
            <div className='h-4 w-px bg-gray-300'></div>
            <span className='text-sm text-gray-500'>Đã bán {product.sold.toLocaleString('vi-VN')}</span>
          </div>

          {/* Price */}
          <div className='mt-auto'>
            <div className='flex items-baseline gap-2 mb-2'>
              <span className='text-xl font-bold text-[#FF6B35]'>
                {formatPrice(product.price)}
              </span>
              {product.originalPrice && (
                <span className='text-sm text-gray-400 line-through'>
                  {formatPrice(product.originalPrice)}
                </span>
              )}
            </div>

            <button className='w-full bg-gradient-to-r from-[#004643] to-[#005d58] hover:from-[#005d58] hover:to-[#004643] text-white py-2.5 rounded-lg font-semibold flex items-center justify-center gap-2 transition-all transform hover:scale-105 shadow-md'>
              <ShoppingCart className='w-4 h-4' />
              Thêm vào giỏ
            </button>
          </div>
        </div>
      </div>
    </Link>
  )

  return (
    <div className='min-h-screen bg-gray-50'>
      {/* Banner Section */}
      <section className='w-full bg-gradient-to-r from-[#004643] to-[#005d58] py-8'>
        <div className='w-full max-w-[100rem] mx-auto px-4 lg:px-6'>
          <div className='relative h-[300px] md:h-[400px] lg:h-[500px] rounded-2xl overflow-hidden shadow-2xl'>
            <Image
              src={bannerData.image}
              alt={bannerData.title}
              fill
              className='object-cover'
              priority
            />
            <div className='absolute inset-0 bg-gradient-to-r from-black/60 to-transparent flex items-center'>
              <div className='px-8 md:px-12 lg:px-16 text-white max-w-2xl'>
                <h1 className='text-3xl md:text-5xl lg:text-6xl font-bold mb-4 drop-shadow-lg'>
                  {bannerData.title}
                </h1>
                <p className='text-lg md:text-xl lg:text-2xl mb-6 drop-shadow-md'>
                  {bannerData.subtitle}
                </p>
                <button className='bg-gradient-to-r from-[#FF6B35] to-[#FF5722] hover:from-[#FF5722] hover:to-[#FF4500] text-white px-8 py-3 md:px-10 md:py-4 rounded-lg font-bold text-lg shadow-xl hover:shadow-2xl transition-all transform hover:scale-105'>
                  Mua Ngay
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Products Section */}
      <section className='w-full py-12 md:py-16'>
        <div className='w-full max-w-[100rem] mx-auto px-4 lg:px-6'>
          {/* Section Header */}
          <div className='flex items-center justify-between mb-8'>
            <div className='flex items-center gap-3'>
              <div className='bg-gradient-to-r from-[#FF6B35] to-[#FF5722] p-2 rounded-lg'>
                <TrendingUp className='w-6 h-6 text-white' />
              </div>
              <h2 className='text-2xl md:text-3xl lg:text-4xl font-bold text-gray-800'>
                Sản Phẩm Nổi Bật
              </h2>
            </div>
            <Link
              href='/products'
              className='text-[#004643] hover:text-[#005d58] font-semibold flex items-center gap-1 transition-colors'
            >
              Xem tất cả
              <span className='text-xl'>→</span>
            </Link>
          </div>

          {/* Products Grid */}
          <div className='grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6'>
            {featuredProducts.map((product) => (
              <ProductCard key={product.id} product={product} showDiscount={true} />
            ))}
          </div>
        </div>
      </section>

      {/* Best Selling Products Section */}
      <section className='w-full py-12 md:py-16 bg-white'>
        <div className='w-full max-w-[100rem] mx-auto px-4 lg:px-6'>
          {/* Section Header */}
          <div className='flex items-center justify-between mb-8'>
            <div className='flex items-center gap-3'>
              <div className='bg-gradient-to-r from-[#004643] to-[#005d58] p-2 rounded-lg'>
                <Flame className='w-6 h-6 text-white' />
              </div>
              <h2 className='text-2xl md:text-3xl lg:text-4xl font-bold text-gray-800'>
                Sản Phẩm Bán Chạy
              </h2>
            </div>
            <Link
              href='/best-selling'
              className='text-[#004643] hover:text-[#005d58] font-semibold flex items-center gap-1 transition-colors'
            >
              Xem tất cả
              <span className='text-xl'>→</span>
            </Link>
          </div>

          {/* Products Grid */}
          <div className='grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 gap-4 md:gap-6'>
            {bestSellingProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter Section */}
      <section className='w-full py-16 md:py-20 bg-gradient-to-r from-[#004643] to-[#005d58]'>
        <div className='w-full max-w-[100rem] mx-auto px-4 lg:px-6'>
          <div className='text-center text-white'>
            <h2 className='text-3xl md:text-4xl font-bold mb-4'>
              Đăng Ký Nhận Tin Khuyến Mãi
            </h2>
            <p className='text-lg md:text-xl mb-8 text-white/80'>
              Nhận thông tin về các chương trình khuyến mãi và sản phẩm mới nhất
            </p>
            <div className='max-w-2xl mx-auto flex flex-col sm:flex-row gap-4'>
              <input
                type='email'
                placeholder='Nhập email của bạn...'
                className='flex-1 px-6 py-4 rounded-lg text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#FF6B35]'
              />
              <button className='bg-gradient-to-r from-[#FF6B35] to-[#FF5722] hover:from-[#FF5722] hover:to-[#FF4500] text-white px-8 py-4 rounded-lg font-bold shadow-xl hover:shadow-2xl transition-all transform hover:scale-105 whitespace-nowrap'>
                Đăng Ký Ngay
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}