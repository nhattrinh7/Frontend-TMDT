'use client'

interface ReviewFiltersProps {
  selectedRating: number | null;
  hasMedia: boolean;
  onRatingChange: (rating: number | null) => void;
  onHasMediaChange: (hasMedia: boolean) => void;
}

export function ReviewFilters({
  selectedRating,
  hasMedia,
  onRatingChange,
  onHasMediaChange,
}: ReviewFiltersProps) {
  const ratingOptions = [
    { label: 'Tất cả', value: null },
    { label: '5 Sao', value: 5 },
    { label: '4 Sao', value: 4 },
    { label: '3 Sao', value: 3 },
    { label: '2 Sao', value: 2 },
    { label: '1 Sao', value: 1 },
  ]

  return (
    <div className='space-y-4'>
      {/* Rating filters */}
      <div className='flex flex-wrap gap-2'>
        {ratingOptions.map((option) => (
          <button
            key={option.label}
            onClick={() => onRatingChange(option.value)}
            className={`rounded-lg px-4 py-2 text-sm font-medium transition-all ${
              selectedRating === option.value
                ? 'bg-emerald-600 text-white'
                : 'border border-slate-300 bg-white text-slate-700 hover:border-emerald-600'
            }`}
          >
            {option.label}
          </button>
        ))}
      </div>

      {/* Media filter */}
      <div className='flex items-center gap-2'>
        <input
          type='checkbox'
          id='hasMedia'
          checked={hasMedia}
          onChange={(e) => onHasMediaChange(e.target.checked)}
          className='h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-600'
        />
        <label
          htmlFor='hasMedia'
          className='text-sm text-slate-700 cursor-pointer hover:text-emerald-600 transition-colors'
        >
          Có hình ảnh / video
        </label>
      </div>
    </div>
  )
}
