'use client'

import { useState, useEffect, useRef } from 'react'
import { Input } from '~/components/ui/input'
import { Search } from 'lucide-react'

type BrandSearchProps = {
  onSearch: (query: string) => void
  placeholder?: string
  debounceMs?: number
}

export default function BrandSearch({
  onSearch,
  placeholder = 'Tìm kiếm theo tên thương hiệu...',
  debounceMs = 500,
}: BrandSearchProps) {
  const [value, setValue] = useState('')
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const onSearchRef = useRef(onSearch)

  useEffect(() => {
    onSearchRef.current = onSearch
  }, [onSearch])

  useEffect(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }

    timeoutRef.current = setTimeout(() => {
      onSearchRef.current(value)
    }, debounceMs)

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [value, debounceMs])

  return (
    <div className="relative w-full max-w-md">
      <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        className="pl-10"
      />
    </div>
  )
}
