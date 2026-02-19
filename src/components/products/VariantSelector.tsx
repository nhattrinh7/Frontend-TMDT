'use client'

import { ProductVariantToSold } from '~/zodSchema/product.schema'
import Image from 'next/image'

interface VariantSelectorProps {
  variants: ProductVariantToSold[]
  selectedVariant: ProductVariantToSold | null
  onVariantSelect: (variant: ProductVariantToSold) => void
}

export function VariantSelector({
  variants,
  selectedVariant,
  onVariantSelect,
}: VariantSelectorProps) {
  if (variants.length === 0) return null

  return (
    <div className="flex flex-wrap gap-3">
      {variants.map((variant) => (
        <button
          key={variant.id}
          onClick={() => onVariantSelect(variant)}
          disabled={variant.stock === 0}
          className={`relative flex items-center gap-2 rounded-lg border-2 px-4 py-3 text-base font-semibold transition-all ${
            selectedVariant?.id === variant.id
              ? 'border-[#004643] bg-white text-gray-900'
              : variant.stock === 0
                ? 'cursor-not-allowed border-gray-200 bg-gray-50 text-gray-400 opacity-50'
                : 'border-gray-300 bg-white text-gray-700 hover:border-[#004643]'
          }`}
        >
          {variant.image && (
            <div className="relative h-8 w-8 shrink-0 overflow-hidden rounded">
              <Image
                src={variant.image}
                alt={variant.sku}
                fill
                className="object-cover"
              />
            </div>
          )}
          <span>{variant.sku}</span>
          {variant.stock === 0 && (
            <span className="absolute -right-1 -top-1 rounded-full bg-red-500 px-1.5 py-0.5 text-[10px] text-white">
              Hết
            </span>
          )}
        </button>
      ))}
    </div>
  )
}
