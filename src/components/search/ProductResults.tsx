'use client'

import { SearchProduct } from '~/zodSchema/search.schema'
import ProductCard from '~/components/products/ProductCard'

interface ProductResultsProps {
  products: SearchProduct[]
}

export default function ProductResults({ products }: ProductResultsProps) {
  if (!products || products.length === 0) {
    return (
      <div className='text-center py-12'>
        <p className='text-gray-500 text-lg'>Không tìm thấy sản phẩm nào</p>
      </div>
    )
  }

  return (
    <div className='grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4'>
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  )
}
