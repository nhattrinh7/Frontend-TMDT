'use client'

interface ProductDescriptionProps {
  description: string
}

export function ProductDescription({ description }: ProductDescriptionProps) {
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6">
      <h2 className="mb-6 text-2xl font-bold text-gray-900">Mô Tả Sản Phẩm</h2>
      <div className="whitespace-pre-wrap text-gray-700">{description}</div>
    </div>
  )
}
