'use client'

interface ProductDescriptionProps {
  description: string;
}

export function ProductDescription({ description }: ProductDescriptionProps) {
  return (
    <div className='bg-white rounded-3xl border border-slate-200 p-8 shadow-sm'>
      <h2 className='text-xl lg:text-2xl font-bold bg-slate-50 -mx-8 -mt-8 px-8 py-6 border-b border-slate-200 rounded-t-3xl mb-8 uppercase tracking-wide text-slate-900'>
        Mô Tả Sản Phẩm
      </h2>
      <article className='prose prose-base lg:prose-lg max-w-none text-slate-700 leading-relaxed whitespace-pre-wrap'>
        {description}
      </article>
    </div>
  )
}
