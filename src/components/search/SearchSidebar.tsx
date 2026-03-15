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
    <div className='w-full shrink-0 space-y-3'>
      {/* Sort Section - Dropdown */}
      <div className='bg-white rounded-xl shadow-sm border border-slate-200 p-3'>
        <h3 className='font-semibold text-slate-700 mb-2 text-xs uppercase tracking-wide'>Sắp xếp theo giá</h3>
        <div className='relative'>
          <button
            onClick={() => setIsSortOpen(!isSortOpen)}
            className='w-full flex items-center justify-between px-3 py-2 border border-slate-200 rounded-lg text-xs bg-white hover:border-[#004643] transition-colors focus:outline-none focus:ring-1 focus:ring-[#004643]/20'
          >
            <span className={currentFilters.sort ? 'text-slate-800 font-medium' : 'text-slate-500'}>
              {getSortLabel()}
            </span>
            <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform ${isSortOpen ? 'rotate-180' : ''}`} />
          </button>
          
          {isSortOpen && (
            <div className='absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-md shadow-lg z-10'>
              <button
                onClick={() => handleSortChange('asc')}
                className={`w-full text-left px-3 py-1.5 text-xs hover:bg-gray-100 transition-colors ${
                  currentFilters.sort === 'asc' ? 'bg-[#004643] text-white hover:bg-[#005d58]' : 'text-gray-700'
                }`}
              >
                Thấp đến cao
              </button>
              <button
                onClick={() => handleSortChange('desc')}
                className={`w-full text-left px-3 py-1.5 text-xs hover:bg-gray-100 transition-colors ${
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
      <div className='bg-white rounded-xl shadow-sm border border-slate-200 p-3'>
        <h3 className='font-semibold text-slate-700 mb-2 text-xs uppercase tracking-wide'>Khoảng giá</h3>
        <div className='space-y-2'>
          <div className='flex items-center gap-1.5'>
            <input
              type='number'
              placeholder='Tối thiểu'
              value={minPriceInput}
              onChange={(e) => setMinPriceInput(e.target.value)}
              className='flex-1 w-0 min-w-0 px-2 py-1.5 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-[#004643]/20 focus:border-[#004643] transition-colors [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none'
            />
            <span className='text-slate-400 font-bold'>-</span>
            <input
              type='number'
              placeholder='Tối đa'
              value={maxPriceInput}
              onChange={(e) => setMaxPriceInput(e.target.value)}
              className='flex-1 w-0 min-w-0 px-2 py-1.5 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-[#004643]/20 focus:border-[#004643] transition-colors [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none'
            />
          </div>
          <button
            onClick={handlePriceApply}
            className='w-full bg-[#004643] hover:bg-[#003835] text-white py-1.5 rounded-lg text-xs font-semibold transition-all'
          >
            Áp dụng
          </button>
        </div>
      </div>

      {/* Rating Filter */}
      <div className='bg-white rounded-xl shadow-sm border border-slate-200 p-3'>
        <h3 className='font-semibold text-slate-700 mb-2 text-xs uppercase tracking-wide'>Đánh giá</h3>
        <div className='space-y-1'>
          {ratingOptions.map((option) => (
            <button
              key={option.value}
              onClick={() => handleRatingFilter(option.value)}
              className={`w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-xs transition-colors ${
                currentFilters.minRating === option.value
                  ? 'bg-amber-50 text-amber-900 border border-amber-200/50 font-medium'
                  : 'hover:bg-slate-50 text-slate-600 border border-transparent font-medium'
              }`}
            >
              <div className='flex items-center gap-0.5'>
                {Array.from({ length: option.value }).map((_, i) => (
                  <Star 
                    key={i} 
                    className='w-3 h-3 fill-amber-400 text-amber-400' 
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
        className='w-full bg-white hover:bg-red-50 text-slate-500 border border-slate-200 hover:border-red-200 hover:text-red-500 py-2 rounded-lg text-xs font-semibold transition-all'
      >
        Xóa tất cả bộ lọc
      </button>
    </div>
  )
}
