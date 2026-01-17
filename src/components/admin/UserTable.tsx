'use client'

import Image from 'next/image'
import { Fragment, useState } from 'react'
import {
  ChevronDown,
  ChevronRight,
  Ban,
  UserCheck,
  User as UserIcon,
  Mail,
  Phone,
  Calendar,
  Shield,
  CheckCircle,
  XCircle,
} from 'lucide-react'
import { Button } from '~/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '~/components/ui/table'
import { Badge } from '~/components/ui/badge'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '~/components/ui/alert-dialog'
import { Avatar, AvatarFallback, AvatarImage } from '~/components/ui/avatar'
import { User } from '~/zodSchema/auth.schema'

type TabType = 'active' | 'banned'

type UserTableProps = {
  users: User[]
  activeTab: TabType
  onBan?: (userId: string) => void
  onUnban?: (userId: string) => void
  isLoading?: boolean
}

export default function UserTable({
  users,
  activeTab,
  onBan,
  onUnban,
  isLoading = false,
}: UserTableProps) {
  const [expandedUsers, setExpandedUsers] = useState<Set<string>>(new Set())
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean
    userId: string
    action: 'ban' | 'unban'
    username: string
  }>({
    open: false,
    userId: '',
    action: 'ban',
    username: '',
  })

  const toggleExpand = (userId: string) => {
    setExpandedUsers((prev) => {
      const next = new Set(prev)
      if (next.has(userId)) {
        next.delete(userId)
      } else {
        next.add(userId)
      }
      return next
    })
  }

  // Format date for display
  const formatDate = (date: string | Date) => {
    return new Date(date).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  // Format gender
  const formatGender = (gender: string) => {
    const genderMap: Record<string, string> = {
      MALE: 'Nam',
      FEMALE: 'Nữ',
      OTHER: 'Khác',
    }
    return genderMap[gender] || gender
  }

  // Get initials from name
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  // Handle confirm action
  const handleConfirmAction = () => {
    if (confirmDialog.action === 'ban' && onBan) {
      onBan(confirmDialog.userId)
    } else if (confirmDialog.action === 'unban' && onUnban) {
      onUnban(confirmDialog.userId)
    }
    setConfirmDialog({ open: false, userId: '', action: 'ban', username: '' })
  }

  // Render actions based on tab
  const renderActions = (user: User) => {
    if (activeTab === 'active') {
      return (
        <Button
          variant="ghost"
          size="sm"
          className="gap-1.5 text-destructive hover:bg-destructive/10 hover:text-destructive"
          onClick={() =>
            setConfirmDialog({
              open: true,
              userId: user.id,
              action: 'ban',
              username: user.username,
            })
          }
        >
          <Ban className="size-4" />
          Ban
        </Button>
      )
    }
    return (
      <Button
        variant="ghost"
        size="sm"
        className="gap-1.5 text-emerald-600 hover:bg-emerald-50 hover:text-emerald-700"
        onClick={() =>
          setConfirmDialog({
            open: true,
            userId: user.id,
            action: 'unban',
            username: user.username,
          })
        }
      >
        <UserCheck className="size-4" />
        Unban
      </Button>
    )
  }

  // Render expanded row content
  const renderExpandedContent = (user: User) => {
    return (
      <TableRow className="bg-muted/30 hover:bg-muted/40">
        <TableCell colSpan={7}>
          <div className="grid gap-4 p-4 sm:grid-cols-2 lg:grid-cols-4">
            {/* Full Name */}
            <div className="flex items-center gap-2">
              <UserIcon className="size-4 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">Họ và tên</p>
                <p className="font-medium">{user.fullName}</p>
              </div>
            </div>

            {/* Date of Birth */}
            <div className="flex items-center gap-2">
              <Calendar className="size-4 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">Ngày sinh</p>
                <p className="font-medium">
                  {new Date(user.dob).toLocaleDateString('vi-VN')}
                </p>
              </div>
            </div>

            {/* Email Verified */}
            <div className="flex items-center gap-2">
              <Mail className="size-4 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">Email đã xác thực</p>
                <div className="flex items-center gap-1">
                  {user.emailVerified ? (
                    <>
                      <CheckCircle className="size-4 text-emerald-500" />
                      <span className="font-medium text-emerald-600">Đã xác thực</span>
                    </>
                  ) : (
                    <>
                      <XCircle className="size-4 text-destructive" />
                      <span className="font-medium text-destructive">Chưa xác thực</span>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* 2FA */}
            <div className="flex items-center gap-2">
              <Shield className="size-4 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">Xác thực 2 bước</p>
                <div className="flex items-center gap-1">
                  {user.require2FA ? (
                    <>
                      <CheckCircle className="size-4 text-emerald-500" />
                      <span className="font-medium text-emerald-600">Đã bật</span>
                    </>
                  ) : (
                    <>
                      <XCircle className="size-4 text-muted-foreground" />
                      <span className="font-medium text-muted-foreground">Chưa bật</span>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Created At */}
            <div className="flex items-center gap-2">
              <Calendar className="size-4 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">Ngày tạo</p>
                <p className="font-medium">{formatDate(user.createdAt)}</p>
              </div>
            </div>

            {/* Updated At */}
            <div className="flex items-center gap-2">
              <Calendar className="size-4 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">Cập nhật lần cuối</p>
                <p className="font-medium">{formatDate(user.updatedAt)}</p>
              </div>
            </div>

            {/* Role ID */}
            <div className="flex items-center gap-2 sm:col-span-2">
              <Shield className="size-4 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">Role ID</p>
                <p className="font-mono text-sm">{user.roleId}</p>
              </div>
            </div>
          </div>
        </TableCell>
      </TableRow>
    )
  }

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="text-muted-foreground">Đang tải...</div>
      </div>
    )
  }

  if (users.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="text-muted-foreground">Không có người dùng nào</div>
      </div>
    )
  }

  return (
    <>
      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead className="w-12"></TableHead>
              <TableHead className="w-16">Avatar</TableHead>
              <TableHead>Username</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Số điện thoại</TableHead>
              <TableHead>Giới tính</TableHead>
              <TableHead className="w-24">Thao tác</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user) => {
              const isExpanded = expandedUsers.has(user.id)

              return (
                <Fragment key={user.id}>
                  <TableRow className="hover:bg-muted/30">
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="size-6"
                        onClick={() => toggleExpand(user.id)}
                      >
                        {isExpanded ? (
                          <ChevronDown className="size-4" />
                        ) : (
                          <ChevronRight className="size-4" />
                        )}
                      </Button>
                    </TableCell>
                    <TableCell>
                      <Avatar className="size-10">
                        <AvatarImage src={user.avatar || undefined} alt={user.username} />
                        <AvatarFallback className="bg-[#004643] text-white">
                          {getInitials(user.fullName || user.username)}
                        </AvatarFallback>
                      </Avatar>
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">{user.username}</div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">{user.email}</div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1.5 text-sm">
                        <Phone className="size-3.5 text-muted-foreground" />
                        {user.phoneNumber}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="font-normal">
                        {formatGender(user.gender)}
                      </Badge>
                    </TableCell>
                    <TableCell>{renderActions(user)}</TableCell>
                  </TableRow>

                  {isExpanded && renderExpandedContent(user)}
                </Fragment>
              )
            })}
          </TableBody>
        </Table>
      </div>

      {/* Confirmation Dialog */}
      <AlertDialog
        open={confirmDialog.open}
        onOpenChange={(open) =>
          setConfirmDialog((prev) => ({ ...prev, open }))
        }
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {confirmDialog.action === 'ban' ? 'Ban người dùng?' : 'Unban người dùng?'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {confirmDialog.action === 'ban' ? (
                <>
                  Bạn có chắc chắn muốn ban người dùng{' '}
                  <span className="font-semibold">{confirmDialog.username}</span>? Người
                  dùng này sẽ không thể đăng nhập vào hệ thống.
                </>
              ) : (
                <>
                  Bạn có chắc chắn muốn unban người dùng{' '}
                  <span className="font-semibold">{confirmDialog.username}</span>? Người
                  dùng này sẽ có thể đăng nhập lại vào hệ thống.
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmAction}
              className={
                confirmDialog.action === 'ban'
                  ? 'bg-destructive hover:bg-destructive/90'
                  : 'bg-emerald-600 hover:bg-emerald-700'
              }
            >
              {confirmDialog.action === 'ban' ? 'Ban' : 'Unban'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
