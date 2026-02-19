'use client'

interface ReviewFiltersProps {
  selectedRating: number | null
  hasMedia: boolean
  onRatingChange: (rating: number | null) => void
  onHasMediaChange: (hasMedia: boolean) => void
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
    <div className="space-y-4">
      {/* Rating filters */}
      <div className="flex flex-wrap gap-2">
        {ratingOptions.map((option) => (
          <button
            key={option.label}
            onClick={() => onRatingChange(option.value)}
            className={`rounded-lg px-4 py-2 text-sm font-medium transition-all ${
              selectedRating === option.value
                ? 'bg-[#004643] text-white'
                : 'border border-gray-300 bg-white text-gray-700 hover:border-[#004643]'
            }`}
          >
            {option.label}
          </button>
        ))}
      </div>

      {/* Media filter */}
      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="hasMedia"
          checked={hasMedia}
          onChange={(e) => onHasMediaChange(e.target.checked)}
          className="h-4 w-4 rounded border-gray-300 text-[#004643] focus:ring-[#004643]"
        />
        <label htmlFor="hasMedia" className="text-sm text-gray-700 cursor-pointer">
          Có hình ảnh / video
        </label>
      </div>
    </div>
  )
}
