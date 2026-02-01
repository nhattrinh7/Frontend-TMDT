'use client'

import { X, Clock } from 'lucide-react'
import { getSearchHistory, removeSearchHistory } from '~/lib/search-history.util'
import { useState, useEffect } from 'react'

interface SearchHistoryDropdownProps {
  onSelect: (query: string) => void
  isVisible: boolean
}

export default function SearchHistoryDropdown({ onSelect, isVisible }: SearchHistoryDropdownProps) {
  const [history, setHistory] = useState<string[]>([])

  useEffect(() => {
    if (isVisible) {
      setHistory(getSearchHistory().slice(0, 5)) // Chỉ hiển thị 5 item gần nhất
    }
  }, [isVisible])

  const handleRemove = (index: number, e: React.MouseEvent) => {
    e.stopPropagation() // Prevent triggering onSelect
    removeSearchHistory(index)
    setHistory(getSearchHistory().slice(0, 5))
  }

  if (!isVisible || history.length === 0) {
    return null
  }

  return (
    <div className='absolute top-full left-0 right-0 mt-1 bg-white rounded-lg shadow-xl border border-gray-200 overflow-hidden z-50'>
      <div className='px-4 py-2 bg-gray-50 border-b border-gray-200'>
        <p className='text-xs text-gray-600 font-semibold'>Lịch sử tìm kiếm</p>
      </div>
      <ul className='max-h-80 overflow-y-auto'>
        {history.map((query, index) => (
          <li
            key={index}
            onClick={() => onSelect(query)}
            className='px-4 py-3 hover:bg-gray-50 cursor-pointer flex items-center justify-between group transition-colors'
          >
            <div className='flex items-center gap-3 flex-1 min-w-0'>
              <Clock className='w-4 h-4 text-gray-400 shrink-0' />
              <span className='text-sm text-gray-700 truncate'>{query}</span>
            </div>
            <button
              onClick={(e) => handleRemove(index, e)}
              className='p-1 hover:bg-gray-200 rounded-full opacity-0 group-hover:opacity-100 transition-opacity shrink-0'
              aria-label='Xóa'
            >
              <X className='w-4 h-4 text-gray-500' />
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}
