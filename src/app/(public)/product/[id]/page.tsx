'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { ProductImageGallery } from '~/app/(public)/product/[id]/ProductImageGallery'
import { VariantSelector } from '~/app/(public)/product/[id]/VariantSelector'
import { QuantitySelector } from '~/app/(public)/product/[id]/QuantitySelector'
import { ShopInfo } from '~/app/(public)/product/[id]/ShopInfo'
import { ProductAttributesDisplay } from '~/app/(public)/product/[id]/ProductAttributesDisplay'
import { ProductDescription } from '~/app/(public)/product/[id]/ProductDescription'
import { ReviewFilters } from '~/app/(public)/product/[id]/ReviewFilters'
import { ReviewList } from '~/app/(public)/product/[id]/ReviewList'
import {
  getProductToSoldAPI,
  getProductReviewsPaginatedAPI,
  trackProductViewAPI,
} from '~/apiRequests/product.apiRequest'
import { addToCartAPI } from '~/apiRequests/user.apiRequest'
import { useBoundStore } from '~/zustand/store'
import type {
  ProductToSold,
  ProductVariantToSold,
  ProductReviewsPaginatedResponse,
} from '~/zodSchema/product.schema'
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '~/components/ui/pagination'
import { formatRating } from '~/lib/utils'

export default function ProductDetailPage() {
  const params = useParams()
  const productId = params.id as string
  const { addItemToCart, addItemToCartWithSelection, user } = useBoundStore()
  const router = useRouter()

  // Product state
  const [product, setProduct] = useState<ProductToSold | null>(null)
  const [selectedVariant, setSelectedVariant] =
    useState<ProductVariantToSold | null>(null)
  const [quantity, setQuantity] = useState(1)
  const [loading, setLoading] = useState(true)
  const [addingToCart, setAddingToCart] = useState(false)
  const [buyingNow, setBuyingNow] = useState(false)

  // Reviews state
  const [reviews, setReviews] =
    useState<ProductReviewsPaginatedResponse | null>(null)
  const [reviewsLoading, setReviewsLoading] = useState(false)
  const [selectedRating, setSelectedRating] = useState<number | null>(null)
  const [hasMedia, setHasMedia] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)

  // Fetch product data
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true)
        const data = await getProductToSoldAPI(productId)
        setProduct(data)
        // Set default selected variant to first variant
        if (data.variants.length > 0) {
          setSelectedVariant(data.variants[0])
        }
      } catch (error) {
        console.error('Error fetching product:', error)
      } finally {
        setLoading(false)
      }
    }

    if (productId) {
      fetchProduct()
    }
  }, [productId])

  // Fetch reviews
  useEffect(() => {
    const fetchReviews = async () => {
      try {
        setReviewsLoading(true)
        const data = await getProductReviewsPaginatedAPI({
          productId,
          page: currentPage,
          limit: 10,
          rating: selectedRating as 1 | 2 | 3 | 4 | 5 | undefined,
          hasMedia: hasMedia || undefined,
        })
        setReviews(data)
      } catch (error) {
        console.error('Error fetching reviews:', error)
      } finally {
        setReviewsLoading(false)
      }
    }

    if (productId) {
      fetchReviews()
    }
  }, [productId, currentPage, selectedRating, hasMedia])

  useEffect(() => {
    if (!user || !productId) return
    trackProductViewAPI(productId).catch(() => {})
  }, [user, productId])

  const handleRatingChange = (rating: number | null) => {
    setSelectedRating(rating)
    setCurrentPage(1) // Reset to page 1 when filter changes
  }

  const handleHasMediaChange = (media: boolean) => {
    setHasMedia(media)
    setCurrentPage(1) // Reset to page 1 when filter changes
  }

  const handleAddToCart = async () => {
    if (!user) {
      toast.error('Vui lòng đăng nhập để thêm vào giỏ hàng')
      return
    }

    if (!selectedVariant) {
      toast.error('Vui lòng chọn phân loại sản phẩm')
      return
    }

    try {
      setAddingToCart(true)
      const response = await addToCartAPI({
        productVariantId: selectedVariant.id,
        quantity: quantity,
      })

      // Cập nhật cart state trong Zustand
      addItemToCart(response.data)

      // Hiển thị toast thành công
      toast.success('Đã thêm vào giỏ hàng thành công')
    } catch (error) {
      // Hiển thị toast lỗi
      toast.error('Không thể thêm vào giỏ hàng')
      console.error('Error adding to cart:', error)
    } finally {
      setAddingToCart(false)
    }
  }

  const handleBuyNow = async () => {
    if (!user) {
      toast.error('Vui lòng đăng nhập để mua hàng')
      return
    }

    if (!selectedVariant) {
      toast.error('Vui lòng chọn phân loại sản phẩm')
      return
    }

    try {
      setBuyingNow(true)
      const response = await addToCartAPI({
        productVariantId: selectedVariant.id,
        quantity: quantity,
      })

      // Cập nhật cart state trong Zustand với isSelected = true
      addItemToCartWithSelection(response.data)

      // Hiển thị toast thành công
      toast.success('Đã thêm vào giỏ hàng')

      // Redirect đến trang giỏ hàng
      router.push('/cart')
    } catch (error) {
      // Hiển thị toast lỗi
      toast.error('Không thể thêm vào giỏ hàng')
      console.error('Error buying now:', error)
    } finally {
      setBuyingNow(false)
    }
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(price)
  }

  if (loading) {
    return (
      <div className='container mx-auto px-4 py-8'>
        <div className='flex items-center justify-center py-20'>
          <div className='text-gray-500'>Đang tải...</div>
        </div>
      </div>
    )
  }

  if (!product) {
    return (
      <div className='container mx-auto px-4 py-8'>
        <div className='flex items-center justify-center py-20'>
          <div className='text-gray-500'>Không tìm thấy sản phẩm</div>
        </div>
      </div>
    )
  }

  const currentPrice = selectedVariant?.price || 0

  return (
    <div className='min-h-screen bg-slate-50 text-slate-900'>
      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12'>
        <div className='space-y-12 lg:space-y-16'>
          {/* Phần 1: Thông tin chính - 2 cột */}
          <section className='bg-white rounded-3xl border border-slate-200 overflow-hidden mb-8 shadow-sm'>
            <div className='grid grid-cols-1 lg:grid-cols-12 gap-12 p-8 lg:p-12 cursor-default'>
              {/* Cột trái: Ảnh */}
              <div className='lg:col-span-5 flex flex-col gap-6'>
                <ProductImageGallery
                  mainImage={product.mainImage}
                  galleryImages={product.galleryImage}
                  video={product.video}
                  productName={product.name}
                />
              </div>

              {/* Cột phải: Thông tin */}
              <div className='lg:col-span-7 flex flex-col gap-8'>
                <div className='flex items-start gap-3 mb-2'>
                  {/* Tên sản phẩm */}
                  <h1 className='text-2xl lg:text-3xl font-bold leading-tight text-slate-900'>
                    {product.name}
                  </h1>
                </div>

                {/* Rating và Lượt bán */}
                <div className='flex items-center gap-6 py-2 border-b border-slate-100 text-sm'>
                  <div className='flex items-center gap-1 border-r border-slate-200 pr-4'>
                    <span className='underline text-emerald-600 font-medium'>
                      {formatRating(product.ratingAvg)}
                    </span>
                    <div className='flex text-emerald-600'>
                      {[1, 2, 3, 4, 5].map((star) => (
                        <svg
                          key={star}
                          className={`h-4 w-4 ${star <= product.ratingAvg ? 'text-emerald-600' : 'text-slate-300'}`}
                          fill='currentColor'
                          viewBox='0 0 20 20'
                        >
                          <path d='M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z' />
                        </svg>
                      ))}
                    </div>
                  </div>
                  <div className='border-r border-slate-200 pr-4'>
                    <span className='underline font-medium'>
                      {product.ratingCount}
                    </span>{' '}
                    <span className='text-slate-500'>Đánh giá</span>
                  </div>
                  <div>
                    <span className='font-medium text-slate-900'>
                      {product.soldQuantity}
                    </span>{' '}
                    <span className='text-slate-500'>Đã bán</span>
                  </div>
                </div>

                {/* Giá */}
                <div className='bg-slate-50 px-6 py-5 lg:px-8 lg:py-6 rounded-2xl my-6 flex items-baseline gap-4'>
                  <span className='text-4xl lg:text-5xl font-bold text-emerald-600 tracking-tight'>
                    {formatPrice(currentPrice)}
                  </span>
                </div>

                {/* Phân loại - Layout ngang */}
                <div className='flex items-start gap-8'>
                  <div className='w-28 shrink-0 pt-2.5 text-base text-slate-500 font-medium'>
                    Phân loại
                  </div>
                  <div className='flex-1'>
                    <VariantSelector
                      variants={product.variants}
                      selectedVariant={selectedVariant}
                      onVariantSelect={setSelectedVariant}
                    />
                  </div>
                </div>

                {/* Số lượng - Layout ngang */}
                <div className='flex items-center gap-8'>
                  <div className='w-28 shrink-0 text-base text-slate-500 font-medium'>
                    Số lượng
                  </div>
                  <div className='flex-1'>
                    <QuantitySelector
                      quantity={quantity}
                      onQuantityChange={setQuantity}
                      maxQuantity={selectedVariant?.stock || 0}
                    />
                  </div>
                </div>

                {/* Buttons */}
                <div className='mt-auto pt-10 flex gap-6'>
                  <button
                    onClick={handleAddToCart}
                    disabled={addingToCart || !selectedVariant}
                    className='flex-1 flex items-center justify-center gap-3 border-2 border-emerald-600 text-emerald-600 hover:bg-emerald-600/5 text-lg font-bold py-4 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed'
                  >
                    <svg
                      className='h-6 w-6'
                      fill='none'
                      stroke='currentColor'
                      viewBox='0 0 24 24'
                    >
                      <path
                        strokeLinecap='round'
                        strokeLinejoin='round'
                        strokeWidth={2}
                        d='M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z'
                      />
                    </svg>
                    {addingToCart ? 'Đang thêm...' : 'Thêm Vào Giỏ'}
                  </button>
                  <button
                    onClick={handleBuyNow}
                    disabled={buyingNow || !selectedVariant}
                    className='flex-1 bg-emerald-600 hover:bg-emerald-700 text-white text-lg font-bold py-4 rounded-xl shadow-lg shadow-emerald-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed'
                  >
                    <span className='flex items-center justify-center gap-3'>
                      <svg
                        className='h-6 w-6'
                        fill='none'
                        stroke='currentColor'
                        viewBox='0 0 24 24'
                      >
                        <path
                          strokeLinecap='round'
                          strokeLinejoin='round'
                          strokeWidth={2}
                          d='M13 10V3L4 14h7v7l9-11h-7z'
                        />
                      </svg>
                      {buyingNow ? 'Đang xử lý...' : 'Mua Ngay'}
                    </span>
                  </button>
                </div>
              </div>
            </div>
          </section>

          {/* Phần 2: Thông tin shop */}
          <ShopInfo shop={product.shop} />

          <div className='space-y-12 lg:space-y-16'>
            {/* Phần 3: Chi tiết sản phẩm */}
            <ProductAttributesDisplay attributes={product.attributes} />

            {/* Phần 4: Mô tả sản phẩm */}
            <ProductDescription description={product.description} />

            {/* Phần 5: Đánh giá sản phẩm */}
            <div className='bg-white rounded-3xl border border-slate-200 p-8 shadow-sm'>
              <h2 className='text-xl lg:text-2xl font-bold bg-slate-50 -mx-8 -mt-8 px-8 py-6 border-b border-slate-200 rounded-t-3xl mb-8 uppercase tracking-wide text-slate-900'>
                Đánh Giá Sản Phẩm
              </h2>

              {/* Filters */}
              <div className='mb-6'>
                <ReviewFilters
                  selectedRating={selectedRating}
                  hasMedia={hasMedia}
                  onRatingChange={handleRatingChange}
                  onHasMediaChange={handleHasMediaChange}
                />
              </div>

              {/* Reviews list */}
              {reviewsLoading ? (
                <div className='py-12 text-center text-gray-500'>
                  Đang tải...
                </div>
              ) : reviews ? (
                <>
                  <ReviewList reviews={reviews.items} />

                  {/* Pagination */}
                  {reviews.meta.totalPages > 1 && (
                    <div className='mt-6'>
                      <Pagination>
                        <PaginationContent>
                          <PaginationItem>
                            <PaginationPrevious
                              onClick={() =>
                                setCurrentPage((prev) => Math.max(1, prev - 1))
                              }
                              className={
                                currentPage === 1
                                  ? 'pointer-events-none opacity-50'
                                  : 'cursor-pointer'
                              }
                            />
                          </PaginationItem>

                          {Array.from(
                            { length: reviews.meta.totalPages },
                            (_, i) => i + 1,
                          ).map((page) => (
                            <PaginationItem key={page}>
                              <PaginationLink
                                onClick={() => setCurrentPage(page)}
                                isActive={page === currentPage}
                                className='cursor-pointer'
                              >
                                {page}
                              </PaginationLink>
                            </PaginationItem>
                          ))}

                          <PaginationItem>
                            <PaginationNext
                              onClick={() =>
                                setCurrentPage((prev) =>
                                  Math.min(reviews.meta.totalPages, prev + 1),
                                )
                              }
                              className={
                                currentPage === reviews.meta.totalPages
                                  ? 'pointer-events-none opacity-50'
                                  : 'cursor-pointer'
                              }
                            />
                          </PaginationItem>
                        </PaginationContent>
                      </Pagination>
                    </div>
                  )}
                </>
              ) : (
                <div className='py-12 text-center text-gray-500'>
                  Không có đánh giá
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
