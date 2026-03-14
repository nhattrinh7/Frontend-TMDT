'use client'

interface ProductAttributesDisplayProps {
  attributes: Record<string, string>;
}

export function ProductAttributesDisplay({
  attributes,
}: ProductAttributesDisplayProps) {
  const entries = Object.entries(attributes)

  if (entries.length === 0) return null

  return (
    <div className='bg-white rounded-3xl border border-slate-200 p-8 shadow-sm'>
      <h2 className='text-xl lg:text-2xl font-bold bg-slate-50 -mx-8 -mt-8 px-8 py-6 border-b border-slate-200 rounded-t-3xl mb-8 uppercase tracking-wide text-slate-900'>
        Chi Tiết Sản Phẩm
      </h2>
      <div className='grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-12 text-base'>
        {entries.map(([key, value]) => (
          <div
            key={key}
            className='flex border-b border-slate-50 pb-3 md:pb-0 md:border-none'
          >
            <span className='w-48 text-slate-500 shrink-0'>{key}</span>
            <span className='font-medium text-slate-900 text-left'>
              {value}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
