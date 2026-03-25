'use client'

import { useCallback, useEffect, useState } from 'react'
import { User, MapPin, Lock, KeyRound, ShoppingBag, Wallet } from 'lucide-react'
import PersonalInfo from '~/app/(private)/profile/PersonalInfo'
import AddressManagement from '~/components/AddressManagement'
import ChangePassword from '~/app/(private)/profile/ChangePassword'
import Passcode from '~/app/(private)/profile/Passcode'
import MyOrders from '~/app/(private)/profile/MyOrders'
import { addMoneyToWalletAPI, getWalletBalanceAPI } from '~/apiRequests/wallet.apiRequest'
import { Button } from '~/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '~/components/ui/dialog'
import { Input } from '~/components/ui/input'
import { Label } from '~/components/ui/label'
import { Skeleton } from '~/components/ui/skeleton'
import { formatPrice } from '~/lib/utils'
import { toast } from 'sonner'

type TabType = 'personal' | 'address' | 'password' | 'passcode' | 'orders' | 'wallet'

export default function ProfilePage() {
  const [activeTab, setActiveTab] = useState<TabType>('orders')
  const [walletBalance, setWalletBalance] = useState(0)
  const [walletLoading, setWalletLoading] = useState(false)
  const [walletLoaded, setWalletLoaded] = useState(false)
  const [walletDialogOpen, setWalletDialogOpen] = useState(false)
  const [walletAmount, setWalletAmount] = useState('')
  const [walletSubmitting, setWalletSubmitting] = useState(false)

  const tabs = [
    {
      id: 'orders' as TabType,
      label: 'Đơn Mua',
      icon: ShoppingBag,
    },
    {
      id: 'wallet' as TabType,
      label: 'Ví Szone',
      icon: Wallet,
    },
    {
      id: 'personal' as TabType,
      label: 'Thông Tin Cá Nhân',
      icon: User,
    },
    {
      id: 'address' as TabType,
      label: 'Quản Lý Địa Chỉ',
      icon: MapPin,
    },
    {
      id: 'password' as TabType,
      label: 'Đổi Mật Khẩu',
      icon: Lock,
    },
    {
      id: 'passcode' as TabType,
      label: 'Passcode',
      icon: KeyRound,
    },
  ]

  const fetchWalletBalance = useCallback(async () => {
    try {
      setWalletLoading(true)
      const wallet = await getWalletBalanceAPI()
      setWalletBalance(wallet.balance)
      setWalletLoaded(true)
    } catch {
      toast.error('Không thể tải số dư ví')
    } finally {
      setWalletLoading(false)
    }
  }, [])

  useEffect(() => {
    if (activeTab !== 'wallet' || walletLoaded) return
    fetchWalletBalance()
  }, [activeTab, fetchWalletBalance, walletLoaded])

  const handleAddMoney = async () => {
    const amount = Number(walletAmount)
    if (!Number.isFinite(amount) || amount <= 0) {
      toast.error('Vui lòng nhập số tiền hợp lệ')
      return
    }

    try {
      setWalletSubmitting(true)
      await addMoneyToWalletAPI({ amount })
      toast.success('Nạp tiền thành công')
      setWalletDialogOpen(false)
      setWalletAmount('')
      fetchWalletBalance()
    } catch {
      toast.error('Nạp tiền thất bại, vui lòng thử lại')
    } finally {
      setWalletSubmitting(false)
    }
  }

  const renderContent = () => {
    switch (activeTab) {
    case 'personal':
      return <PersonalInfo />
    case 'address':
      return <AddressManagement />
    case 'password':
      return <ChangePassword />
    case 'passcode':
      return <Passcode />
    case 'orders':
      return <MyOrders />
    case 'wallet':
      return (
        <div className='space-y-6'>
          <Card className='bg-white shadow-sm border border-[#004643]/10'>
            <CardHeader className='pb-2'>
              <CardTitle className='text-sm font-semibold text-[#004643]/70'>Số dư ví hiện tại</CardTitle>
            </CardHeader>
            <CardContent>
              {walletLoading ? (
                <Skeleton className='h-9 w-[200px]' />
              ) : (
                <div className='text-3xl font-bold text-[#004643]'>
                  {formatPrice(walletBalance)}
                </div>
              )}
              <p className='text-sm text-muted-foreground mt-2'>
                Số dư hiện tại của bạn trong ví Szone.
              </p>
            </CardContent>
          </Card>

          <Card className='bg-white shadow-sm border border-[#004643]/10'>
            <CardHeader className='pb-2'>
              <CardTitle className='text-sm font-semibold text-[#004643]/70'>Nạp tiền vào ví</CardTitle>
            </CardHeader>
            <CardContent className='flex flex-col gap-4'>
              <p className='text-sm text-muted-foreground'>
                Nạp tiền để thanh toán nhanh chóng và tiện lợi hơn.
              </p>
              <Dialog open={walletDialogOpen} onOpenChange={setWalletDialogOpen}>
                <DialogTrigger asChild>
                  <Button className='w-fit bg-[#004643] hover:bg-[#003330] text-white'>
                    Nạp tiền vào ví
                  </Button>
                </DialogTrigger>
                <DialogContent className='sm:max-w-[420px] bg-white'>
                  <DialogHeader>
                    <DialogTitle>Nạp tiền vào ví</DialogTitle>
                    <DialogDescription>
                      Nhập số tiền bạn muốn nạp vào ví Szone.
                    </DialogDescription>
                  </DialogHeader>
                  <div className='space-y-2'>
                    <Label htmlFor='wallet-amount'>Số tiền</Label>
                    <Input
                      id='wallet-amount'
                      type='number'
                      min={1}
                      step={1000}
                      placeholder='Ví dụ: 100000'
                      value={walletAmount}
                      onChange={(event) => setWalletAmount(event.target.value)}
                    />
                  </div>
                  <DialogFooter>
                    <Button
                      type='button'
                      variant='outline'
                      onClick={() => setWalletDialogOpen(false)}
                      disabled={walletSubmitting}
                    >
                      Hủy
                    </Button>
                    <Button
                      type='button'
                      className='bg-[#004643] hover:bg-[#003330] text-white'
                      onClick={handleAddMoney}
                      disabled={walletSubmitting}
                    >
                      {walletSubmitting ? 'Đang nạp...' : 'Nạp'}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </CardContent>
          </Card>
        </div>
      )
    default:
      return <MyOrders />
    }
  }

  return (
    <div className='min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8'>
      <div className='w-full max-w-400 mx-auto'>
        <div className='grid grid-cols-1 lg:grid-cols-4 gap-6'>
          {/* Sidebar */}
          <div className='lg:col-span-1'>
            <div className='bg-white rounded-2xl shadow-lg p-6 sticky top-8'>
              <h2 className='text-xl font-bold text-gray-800 mb-4'>Tài Khoản</h2>
              <nav className='space-y-2'>
                {tabs.map((tab) => {
                  const Icon = tab.icon
                  const isActive = activeTab === tab.id
                  const tabClassName = `w-full flex items-center gap-3 px-4 py-3 rounded-lg font-semibold transition-all ${
                    isActive
                      ? 'bg-linear-to-r from-[#004643] to-[#005d58] text-white shadow-md'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`

                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={tabClassName}
                    >
                      <Icon className='w-5 h-5' />
                      <span>{tab.label}</span>
                    </button>
                  )
                })}
              </nav>
            </div>
          </div>

          {/* Content */}
          <div className='lg:col-span-3'>
            {renderContent()}
          </div>
        </div>
      </div>
    </div>
  )
}
