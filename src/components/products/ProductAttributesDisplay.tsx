'use client'

interface ProductAttributesDisplayProps {
  attributes: Record<string, string>
}

export function ProductAttributesDisplay({
  attributes,
}: ProductAttributesDisplayProps) {
  const entries = Object.entries(attributes)

  if (entries.length === 0) return null

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6">
      <h2 className="mb-6 text-2xl font-bold text-gray-900">Chi Tiết Sản Phẩm</h2>
      <div className="space-y-3">
        {entries.map(([key, value]) => (
          <div key={key} className="flex border-b border-gray-100 pb-3 last:border-0">
            <div className="w-1/3 text-gray-600">{key}</div>
            <div className="w-2/3 font-semibold text-gray-900">{value}</div>
          </div>
        ))}
      </div>
    </div>
  )
}
