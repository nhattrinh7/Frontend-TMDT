'use client'

import { useState } from 'react'
import { Star, ChevronDown } from 'lucide-react'

interface SearchSidebarProps {
  onFilterChange: (filters: {
    sort?: 'asc' | 'desc'
    minPrice?: number
    maxPrice?: number
    minRating?: number
  }) => void
  currentFilters: {
    sort?: 'asc' | 'desc'
    minPrice?: number
    maxPrice?: number
    minRating?: number
  }
}

export default function SearchSidebar({ onFilterChange, currentFilters }: SearchSidebarProps) {
  const [minPriceInput, setMinPriceInput] = useState(currentFilters.minPrice?.toString() || '')
  const [maxPriceInput, setMaxPriceInput] = useState(currentFilters.maxPrice?.toString() || '')
  const [isSortOpen, setIsSortOpen] = useState(false)

  const handleSortChange = (sort: 'asc' | 'desc') => {
    onFilterChange({ ...currentFilters, sort })
    setIsSortOpen(false)
  }

  const handlePriceApply = () => {
    const minPrice = minPriceInput ? parseFloat(minPriceInput) : undefined
    const maxPrice = maxPriceInput ? parseFloat(maxPriceInput) : undefined
    
    onFilterChange({ ...currentFilters, minPrice, maxPrice })
  }

  const handleRatingFilter = (minRating: number) => {
    onFilterChange({ ...currentFilters, minRating })
  }

  const handleClearAll = () => {
    setMinPriceInput('')
    setMaxPriceInput('')
    onFilterChange({
      sort: undefined,
      minPrice: undefined,
      maxPrice: undefined,
      minRating: undefined,
    })
  }

  const getSortLabel = () => {
    if (currentFilters.sort === 'asc') return 'Thấp đến cao'
    if (currentFilters.sort === 'desc') return 'Cao đến thấp'
    return 'Chọn sắp xếp'
  }

  const ratingOptions = [
    { value: 5, label: '5 sao' },
    { value: 4, label: 'Từ 4 sao' },
    { value: 3, label: 'Từ 3 sao' },
    { value: 2, label: 'Từ 2 sao' },
    { value: 1, label: 'Từ 1 sao' },
  ]

  return (
    <div className='w-64 shrink-0 space-y-6'>
      {/* Sort Section - Dropdown */}
      <div className='bg-white rounded-lg shadow-md p-4'>
        <h3 className='font-semibold text-gray-800 mb-3 text-sm'>Sắp xếp theo giá</h3>
        <div className='relative'>
          <button
            onClick={() => setIsSortOpen(!isSortOpen)}
            className='w-full flex items-center justify-between px-3 py-2 border border-gray-300 rounded-md text-sm bg-white hover:border-[#004643] transition-colors'
          >
            <span className={currentFilters.sort ? 'text-gray-800' : 'text-gray-500'}>
              {getSortLabel()}
            </span>
            <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${isSortOpen ? 'rotate-180' : ''}`} />
          </button>
          
          {isSortOpen && (
            <div className='absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-md shadow-lg z-10'>
              <button
                onClick={() => handleSortChange('asc')}
                className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-100 transition-colors ${
                  currentFilters.sort === 'asc' ? 'bg-[#004643] text-white hover:bg-[#005d58]' : 'text-gray-700'
                }`}
              >
                Thấp đến cao
              </button>
              <button
                onClick={() => handleSortChange('desc')}
                className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-100 transition-colors ${
                  currentFilters.sort === 'desc' ? 'bg-[#004643] text-white hover:bg-[#005d58]' : 'text-gray-700'
                }`}
              >
                Cao đến thấp
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Price Range Filter */}
      <div className='bg-white rounded-lg shadow-md p-4'>
        <h3 className='font-semibold text-gray-800 mb-3 text-sm'>Khoảng giá</h3>
        <div className='space-y-3'>
          <div className='flex items-center gap-2'>
            <input
              type='number'
              placeholder='Tối thiểu'
              value={minPriceInput}
              onChange={(e) => setMinPriceInput(e.target.value)}
              className='flex-1 min-w-0 px-2 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#004643] focus:border-transparent [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none'
            />
            <span className='text-gray-400'>-</span>
            <input
              type='number'
              placeholder='Tối đa'
              value={maxPriceInput}
              onChange={(e) => setMaxPriceInput(e.target.value)}
              className='flex-1 min-w-0 px-2 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#004643] focus:border-transparent [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none'
            />
          </div>
          <button
            onClick={handlePriceApply}
            className='w-full bg-[#004643] hover:bg-[#005d58] text-white py-2 rounded-md text-sm font-semibold transition-colors'
          >
            Áp dụng
          </button>
        </div>
      </div>

      {/* Rating Filter */}
      <div className='bg-white rounded-lg shadow-md p-4'>
        <h3 className='font-semibold text-gray-800 mb-3 text-sm'>Đánh giá</h3>
        <div className='space-y-2'>
          {ratingOptions.map((option) => (
            <button
              key={option.value}
              onClick={() => handleRatingFilter(option.value)}
              className={`w-full flex items-center gap-2 px-3 py-2 rounded-md text-sm transition-colors ${
                currentFilters.minRating === option.value
                  ? 'bg-[#004643] text-white'
                  : 'hover:bg-gray-100 text-gray-700'
              }`}
            >
              <div className='flex items-center gap-1'>
                {Array.from({ length: option.value }).map((_, i) => (
                  <Star 
                    key={i} 
                    className={`w-4 h-4 ${
                      currentFilters.minRating === option.value 
                        ? 'fill-yellow-400 text-yellow-400' 
                        : 'fill-yellow-400 text-yellow-400'
                    }`} 
                  />
                ))}
              </div>
              <span>{option.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Clear All Button */}
      <button
        onClick={handleClearAll}
        className='w-full bg-white hover:bg-gray-50 text-gray-700 border-2 border-gray-300 hover:border-red-500 hover:text-red-600 py-2.5 rounded-md text-sm font-semibold transition-colors shadow-md'
      >
        Xóa tất cả bộ lọc
      </button>
    </div>
  )
}
