'use client'

import { useState, useEffect } from 'react'
import { Search } from 'lucide-react'
import { Input } from '~/components/ui/input'

type ShopSearchProps = {
  onSearch: (query: string) => void
  placeholder?: string
}

export default function ShopSearch({
  onSearch,
  placeholder = 'Tìm kiếm shop...',
}: ShopSearchProps) {
  const [searchValue, setSearchValue] = useState('')

  useEffect(() => {
    const debounce = setTimeout(() => {
      onSearch(searchValue)
    }, 300)

    return () => clearTimeout(debounce)
  }, [searchValue, onSearch])

  return (
    <div className='relative w-full max-w-sm'>
      <Search className='absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground' />
      <Input
        type='text'
        placeholder={placeholder}
        value={searchValue}
        onChange={(e) => setSearchValue(e.target.value)}
        className='pl-10'
      />
    </div>
  )
}
