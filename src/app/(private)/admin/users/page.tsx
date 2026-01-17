'use client'

import { useState, useEffect, useCallback } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '~/components/ui/tabs'
import { toast } from 'sonner'
import UserTable from '~/components/admin/UserTable'
import UserSearch from '~/components/admin/UserSearch'
import UserPagination from '~/components/admin/UserPagination'
import {
  getUsersPaginatedAPI,
  banUserAPI,
  unbanUserAPI,
} from '~/apiRequests/admin.apiRequest'
import { User } from '~/zodSchema/auth.schema'
import { AdminPaginationMeta } from '~/zodSchema/admin.schema'

type TabType = 'active' | 'banned'

const TAB_CONFIG: Record<TabType, { label: string; status: 'ACTIVE' | 'BANNED' }> = {
  active: { label: 'Đang hoạt động', status: 'ACTIVE' },
  banned: { label: 'Đã bị ban', status: 'BANNED' },
}

const DEFAULT_LIMIT = 10

export default function ManageUsersPage() {
  const [activeTab, setActiveTab] = useState<TabType>('active')
  const [users, setUsers] = useState<User[]>([])
  const [meta, setMeta] = useState<AdminPaginationMeta>({
    total: 0,
    page: 1,
    limit: DEFAULT_LIMIT,
    totalPages: 0,
  })
  const [searchQuery, setSearchQuery] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const fetchUsers = useCallback(async () => {
    setIsLoading(true)
    try {
      const config = TAB_CONFIG[activeTab]
      const response = await getUsersPaginatedAPI({
        page: meta.page,
        limit: meta.limit,
        search: searchQuery || undefined,
        status: config.status,
      })

      if (response) {
        setUsers(response.users)
        setMeta(response.meta)
      }
    } catch (error) {
      console.error('Failed to fetch users:', error)
      toast.error('Không thể tải danh sách người dùng')
    } finally {
      setIsLoading(false)
    }
  }, [activeTab, meta.page, meta.limit, searchQuery])

  useEffect(() => {
    fetchUsers()
  }, [fetchUsers])

  const handleTabChange = (value: string) => {
    setActiveTab(value as TabType)
    setMeta((prev) => ({ ...prev, page: 1 }))
    setSearchQuery('')
  }

  const handleSearch = (query: string) => {
    setSearchQuery(query)
    setMeta((prev) => ({ ...prev, page: 1 }))
  }

  const handlePageChange = (page: number) => {
    setMeta((prev) => ({ ...prev, page }))
  }

  const handleBanUser = async (userId: string) => {
    try {
      await banUserAPI(userId)
      toast.success('Đã ban người dùng thành công')
      fetchUsers()
    } catch (error) {
      console.error('Failed to ban user:', error)
      toast.error('Không thể ban người dùng')
    }
  }

  const handleUnbanUser = async (userId: string) => {
    try {
      await unbanUserAPI(userId)
      toast.success('Đã unban người dùng thành công')
      fetchUsers()
    } catch (error) {
      console.error('Failed to unban user:', error)
      toast.error('Không thể unban người dùng')
    }
  }

  return (
    <div className="flex flex-col gap-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-[#004643]">Quản lý người dùng</h1>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          {(Object.entries(TAB_CONFIG) as [TabType, typeof TAB_CONFIG[TabType]][]).map(
            ([key, config]) => (
              <TabsTrigger key={key} value={key} className="text-sm">
                {config.label}
              </TabsTrigger>
            )
          )}
        </TabsList>

        {(Object.keys(TAB_CONFIG) as TabType[]).map((tab) => (
          <TabsContent key={tab} value={tab} className="mt-6 space-y-4">
            {/* Search */}
            <div className="flex items-center justify-between gap-4">
              <UserSearch onSearch={handleSearch} />
              <div className="text-sm text-muted-foreground">
                Tổng: {meta.total} người dùng
              </div>
            </div>

            {/* Table */}
            <UserTable
              users={users}
              activeTab={activeTab}
              onBan={handleBanUser}
              onUnban={handleUnbanUser}
              isLoading={isLoading}
            />

            {/* Pagination */}
            <div className="flex justify-center">
              <UserPagination meta={meta} onPageChange={handlePageChange} />
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  )
}
