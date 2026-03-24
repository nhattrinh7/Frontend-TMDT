'use client'

import { useState, useEffect, useRef } from 'react'
import { Input } from '~/components/ui/input'
import { Search } from 'lucide-react'

type UserSearchProps = {
  onSearch: (query: string) => void
  placeholder?: string
  debounceMs?: number
}

export default function UserSearch({
  onSearch,
  placeholder = 'Tìm kiếm theo username, email, số điện thoại...',
  debounceMs = 500,
}: UserSearchProps) {
  const [value, setValue] = useState('')
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const onSearchRef = useRef(onSearch)

  // Keep onSearch ref updated
  useEffect(() => {
    onSearchRef.current = onSearch
  }, [onSearch])

  useEffect(() => {
    // Clear previous timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }

    // Set new timeout for debounce
    timeoutRef.current = setTimeout(() => {
      onSearchRef.current(value)
    }, debounceMs)

    // Cleanup on unmount or value change
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [value, debounceMs])

  return (
    <div className='relative w-full max-w-md'>
      <Search className='absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground' />
      <Input
        type='text'
        placeholder={placeholder}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        className='pl-10'
      />
    </div>
  )
}
