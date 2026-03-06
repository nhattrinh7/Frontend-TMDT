'use client'

import { useEffect, useRef, useCallback } from 'react'

interface UseInfiniteScrollOptions {
  onLoadMore: () => void
  hasMore: boolean
  isLoading: boolean
  rootMargin?: string
}

/**
 * Custom hook bọc IntersectionObserver cho infinity scroll.
 * Khi sentinel element xuất hiện trong viewport VÀ hasMore === true VÀ isLoading === false → gọi onLoadMore.
 */
export function useInfiniteScroll({ onLoadMore, hasMore, isLoading, rootMargin = '100px' }: UseInfiniteScrollOptions) {
  const sentinelRef = useRef<HTMLDivElement>(null)
  const onLoadMoreRef = useRef(onLoadMore)

  // Luôn cập nhật ref để callback trong IntersectionObserver luôn dùng phiên bản mới nhất
  useEffect(() => {
    onLoadMoreRef.current = onLoadMore
  }, [onLoadMore])

  useEffect(() => {
    const sentinel = sentinelRef.current
    if (!sentinel) return

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0]
        if (entry.isIntersecting && hasMore && !isLoading) {
          onLoadMoreRef.current()
        }
      },
      { rootMargin },
    )

    observer.observe(sentinel)

    return () => {
      observer.disconnect()
    }
  }, [hasMore, isLoading, rootMargin])

  return { sentinelRef }
}
