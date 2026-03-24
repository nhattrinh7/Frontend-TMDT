'use client'

import { useState } from 'react'
import { User, MapPin, Lock, KeyRound, ShoppingBag } from 'lucide-react'
import PersonalInfo from '~/app/(private)/profile/PersonalInfo'
import AddressManagement from '~/components/AddressManagement'
import ChangePassword from '~/app/(private)/profile/ChangePassword'
import Passcode from '~/app/(private)/profile/Passcode'
import MyOrders from '~/app/(private)/profile/MyOrders'

type TabType = 'personal' | 'address' | 'password' | 'passcode' | 'orders'

export default function ProfilePage() {
  const [activeTab, setActiveTab] = useState<TabType>('orders')

  const tabs = [
    {
      id: 'orders' as TabType,
      label: 'Đơn Mua',
      icon: ShoppingBag,
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
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg font-semibold transition-all ${
                        isActive
                          ? 'bg-linear-to-r from-[#004643] to-[#005d58] text-white shadow-md'
                          : 'text-gray-700 hover:bg-gray-100'
                      }`}
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