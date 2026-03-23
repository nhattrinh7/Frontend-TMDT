'use client'

import { useEffect, useMemo, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { ChevronLeft, ChevronRight, Layers } from 'lucide-react'
import { getRootCategoriesAPI } from '~/apiRequests/category.apiRequest'
import { Category } from '~/zodSchema/category.schema'
import { Skeleton } from '~/components/ui/skeleton'

const CATEGORY_IMAGE_MAP: Record<string, string> = {
  'Thời trang': '/images/categories/thời trang.jpg',
  'Sắc Đẹp': '/images/categories/sắc đẹp.png',
  'Sức Khỏe': '/images/categories/sức khỏe.jpg',
  'Phụ Kiện Thời Trang': '/images/categories/phụ kiện thời trang.jpg',
  'Thiết Bị Điện Gia Dụng': '/images/categories/thiết bị điện gia dụng.jpeg',
  'Giày Dép': '/images/categories/giày dép.jpg',
  'Túi Ví': '/images/categories/túi ví.png',
  'Đồng Hồ': '/images/categories/đồng hồ.jpg',
  'Thiết Bị Âm Thanh': '/images/categories/thiết bị âm thanh.png',
  'Thực phẩm và đồ uống': '/images/categories/thực phẩm và đồ uống.jpg',
  'Mẹ & Bé': '/images/categories/mẹ và bé.jpg',
  'Cameras & Flycam': '/images/categories/camera và flycam.jpg',
  'Nhà cửa & Đời sống': '/images/categories/nhà cửa và đời sống.jpg',
  'Thể Thao & Dã Ngoại': '/images/categories/thể thao và dã ngoại.jpg',
  'Văn Phòng Phẩm': '/images/categories/văn phòng phẩm.jpg',
  'Máy tính & Laptop': '/images/categories/máy tính và laptop.png',
  'Điện Thoại và Phụ Kiện': '/images/categories/điện thoại và phụ kiện.png',
}

const VISIBLE_COUNT = 16

export default function HomeCategorySection() {
  const [rootCategories, setRootCategories] = useState<Category[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [pageIndex, setPageIndex] = useState(0)

  useEffect(() => {
    const fetchRootCategories = async () => {
      try {
        setIsLoading(true)
        const response = await getRootCategoriesAPI()
        setRootCategories(response.data)
      } catch {
        setRootCategories([])
      } finally {
        setIsLoading(false)
      }
    }

    fetchRootCategories()
  }, [])

  const maxPageIndex = Math.max(0, Math.ceil(rootCategories.length / VISIBLE_COUNT) - 1)
  const showArrows = rootCategories.length > VISIBLE_COUNT

  const visibleCategories = useMemo(() => {
    const startIndex = pageIndex * VISIBLE_COUNT
    return rootCategories.slice(startIndex, startIndex + VISIBLE_COUNT)
  }, [rootCategories, pageIndex])

  const handlePrev = () => {
    setPageIndex((prev) => Math.max(0, prev - 1))
  }

  const handleNext = () => {
    setPageIndex((prev) => Math.min(maxPageIndex, prev + 1))
  }

  const getCategoryImage = (name: string) => {
    const imagePath = CATEGORY_IMAGE_MAP[name] || '/images/categories/thời trang.jpg'
    return encodeURI(imagePath)
  }

  return (
    <section className='w-full py-10 md:py-12'>
      <div className='w-full max-w-400 mx-auto px-4 lg:px-6'>
        <div className='flex flex-wrap items-center justify-between gap-3 mb-6'>
          <div className='flex items-center gap-3'>
            <div className='bg-linear-to-r from-[#004643] to-[#005d58] p-2 rounded-lg'>
              <Layers className='w-6 h-6 text-white' />
            </div>
            <h2 className='text-xl md:text-2xl lg:text-3xl font-bold text-gray-800'>
              Danh mục sản phẩm
            </h2>
          </div>
          <p className='text-sm text-gray-500'>
            Hiển thị {Math.min(VISIBLE_COUNT, rootCategories.length)} / {rootCategories.length}
          </p>
        </div>

        <div className='relative'>
          {showArrows && (
            <button
              type='button'
              onClick={handlePrev}
              disabled={pageIndex === 0}
              className={`absolute -left-3 top-1/2 -translate-y-1/2 z-10 h-9 w-9 rounded-full border bg-white shadow-md transition-all ${
                pageIndex === 0 ? 'opacity-40 cursor-not-allowed' : 'hover:border-[#004643] hover:text-[#004643]'
              }`}
              aria-label='Xem danh mục trước'
            >
              <ChevronLeft className='w-5 h-5 mx-auto' />
            </button>
          )}

          {showArrows && (
            <button
              type='button'
              onClick={handleNext}
              disabled={pageIndex === maxPageIndex}
              className={`absolute -right-3 top-1/2 -translate-y-1/2 z-10 h-9 w-9 rounded-full border bg-white shadow-md transition-all ${
                pageIndex === maxPageIndex ? 'opacity-40 cursor-not-allowed' : 'hover:border-[#004643] hover:text-[#004643]'
              }`}
              aria-label='Xem danh mục tiếp theo'
            >
              <ChevronRight className='w-5 h-5 mx-auto' />
            </button>
          )}

          {isLoading ? (
            <div className='grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3 md:gap-4'>
              {Array.from({ length: VISIBLE_COUNT }).map((_, index) => (
                <Skeleton key={index} className='h-28 w-full rounded-2xl' />
              ))}
            </div>
          ) : (
            <div className='grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3 md:gap-4'>
              {visibleCategories.map((category) => (
                <Link
                  key={category.id}
                  href={`/category/${encodeURIComponent(category.name)}`}
                  className='group rounded-2xl bg-white border border-gray-100 shadow-sm hover:shadow-md transition-all'
                >
                  <div className='p-3'>
                    <div className='relative aspect-square w-full overflow-hidden rounded-xl bg-gray-50'>
                      <Image
                        src={getCategoryImage(category.name)}
                        alt={category.name}
                        fill
                        className='object-cover transition-transform duration-300 group-hover:scale-105'
                      />
                    </div>
                    <p className='mt-2 text-sm font-semibold text-gray-800 text-center line-clamp-2'>
                      {category.name}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
