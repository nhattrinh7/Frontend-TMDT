'use client'

import { useState, useCallback } from 'react'
import { ChevronRight, ChevronDown, FolderTree, Check } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from '~/components/ui/dialog'
import { Button } from '~/components/ui/button'
import { ScrollArea } from '~/components/ui/scroll-area'
import { cn } from '~/lib/utils'
import { CategoryWithChildren } from '~/zodSchema/category.schema'

type CategorySelectorProps = {
  categories: CategoryWithChildren[]
  selectedCategory: CategoryWithChildren | null
  onSelect: (category: CategoryWithChildren) => void
}

// Component hiển thị từng category item
function CategoryItem({
  category,
  level = 0,
  selectedId,
  onSelect,
  expandedIds,
  onToggleExpand,
}: {
  category: CategoryWithChildren
  level?: number
  selectedId?: string
  onSelect: (category: CategoryWithChildren) => void
  expandedIds: Set<string>
  onToggleExpand: (id: string) => void
}) {
  const hasChildren = category.children && category.children.length > 0
  const isExpanded = expandedIds.has(category.id)
  const isSelected = selectedId === category.id
  const isLeaf = !hasChildren

  const handleClick = () => {
    if (isLeaf) {
      // Chỉ cho phép chọn leaf node
      onSelect(category)
    } else {
      // Toggle expand cho category cha
      onToggleExpand(category.id)
    }
  }

  return (
    <div>
      <div
        className={cn(
          'flex items-center gap-2 py-2 px-3 rounded-lg cursor-pointer transition-colors',
          'hover:bg-muted/60',
          isSelected && 'bg-primary/10 text-primary font-medium',
          level > 0 && 'ml-4',
        )}
        style={{ paddingLeft: `${level * 16 + 12}px` }}
        onClick={handleClick}
      >
        {/* Icon expand/collapse cho category cha */}
        {hasChildren ? (
          <span className='w-5 h-5 flex items-center justify-center'>
            {isExpanded ? (
              <ChevronDown className='h-4 w-4 text-muted-foreground' />
            ) : (
              <ChevronRight className='h-4 w-4 text-muted-foreground' />
            )}
          </span>
        ) : (
          <span className='w-5 h-5' />
        )}

        {/* Bullet point */}
        <span
          className={cn(
            'w-2 h-2 rounded-full',
            isLeaf ? 'bg-primary' : 'bg-muted-foreground/50',
          )}
        />

        {/* Category name */}
        <span className='flex-1'>{category.name}</span>

        {/* Check icon nếu được chọn */}
        {isSelected && <Check className='h-4 w-4 text-primary' />}
      </div>

      {/* Render children nếu expand */}
      {hasChildren && isExpanded && (
        <div className='border-l border-muted ml-6'>
          {category.children!.map((child) => (
            <CategoryItem
              key={child.id}
              category={child}
              level={level + 1}
              selectedId={selectedId}
              onSelect={onSelect}
              expandedIds={expandedIds}
              onToggleExpand={onToggleExpand}
            />
          ))}
        </div>
      )}
    </div>
  )
}

// Xây dựng cây category từ flat list
function buildCategoryTree(
  categories: CategoryWithChildren[],
): CategoryWithChildren[] {
  const categoryMap = new Map<string, CategoryWithChildren>()
  const rootCategories: CategoryWithChildren[] = []

  // Tạo map của tất cả categories
  categories.forEach((cat) => {
    categoryMap.set(cat.id, { ...cat, children: [] })
  })

  // Xây dựng cây
  categories.forEach((cat) => {
    const category = categoryMap.get(cat.id)!
    if (cat.parentId && categoryMap.has(cat.parentId)) {
      const parent = categoryMap.get(cat.parentId)!
      if (!parent.children) parent.children = []
      parent.children.push(category)
    } else {
      rootCategories.push(category)
    }
  })

  return rootCategories
}

// Lấy đường dẫn từ gốc đến category được chọn
function getCategoryPath(
  categories: CategoryWithChildren[],
  targetId: string,
  path: string[] = [],
): string[] | null {
  for (const cat of categories) {
    if (cat.id === targetId) {
      return [...path, cat.name]
    }
    if (cat.children && cat.children.length > 0) {
      const found = getCategoryPath(cat.children, targetId, [
        ...path,
        cat.name,
      ])
      if (found) return found
    }
  }
  return null
}

export default function CategorySelector({
  categories,
  selectedCategory,
  onSelect,
}: CategorySelectorProps) {
  const [open, setOpen] = useState(false)
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set())

  // Xây dựng cây từ flat list (nếu categories là flat)
  const categoryTree =
    !categories || categories.length === 0
      ? []
      : categories[0].children !== undefined
        ? categories
        : buildCategoryTree(categories)

  const handleToggleExpand = useCallback((id: string) => {
    setExpandedIds((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(id)) {
        newSet.delete(id)
      } else {
        newSet.add(id)
      }
      return newSet
    })
  }, [])

  const handleSelect = useCallback(
    (category: CategoryWithChildren) => {
      onSelect(category)
      setOpen(false)
    },
    [onSelect],
  )

  // Lấy đường dẫn category đã chọn
  const selectedPath = selectedCategory
    ? getCategoryPath(categoryTree, selectedCategory.id)
    : null

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant='outline'
          className='w-full justify-start text-left h-auto min-h-10 py-2'
        >
          <FolderTree className='mr-2 h-4 w-4 text-muted-foreground' />
          {selectedCategory ? (
            <div className='flex flex-col items-start'>
              <span className='font-medium'>{selectedCategory.name}</span>
              {selectedPath && (
                <span className='text-xs text-muted-foreground'>
                  {selectedPath.join(' > ')}
                </span>
              )}
            </div>
          ) : (
            <span className='text-muted-foreground'>Chọn ngành hàng...</span>
          )}
        </Button>
      </DialogTrigger>

      <DialogContent className='sm:max-w-lg max-h-[80vh]'>
        <DialogHeader>
          <DialogTitle className='flex items-center gap-2'>
            <FolderTree className='h-5 w-5' />
            Chọn ngành hàng
          </DialogTitle>
        </DialogHeader>

        <div className='text-sm text-muted-foreground mb-3'>
          Vui lòng chọn ngành hàng cấp thấp nhất (không có danh mục con)
        </div>

        <ScrollArea className='h-[400px] pr-4'>
          <div className='space-y-1'>
            {categoryTree.map((category) => (
              <CategoryItem
                key={category.id}
                category={category}
                selectedId={selectedCategory?.id}
                onSelect={handleSelect}
                expandedIds={expandedIds}
                onToggleExpand={handleToggleExpand}
              />
            ))}
          </div>
        </ScrollArea>

        <div className='flex justify-end pt-4 border-t'>
          <DialogClose asChild>
            <Button variant='outline'>Đóng</Button>
          </DialogClose>
        </div>
      </DialogContent>
    </Dialog>
  )
}
