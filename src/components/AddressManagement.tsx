

'use client'

import { useState, useEffect, useMemo } from 'react'
import { Plus, Edit, Trash2, MapPin, Phone, X } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { useBoundStore } from '~/zustand/store'
import { 
  addAddressAPI, 
  deleteAddressAPI, 
  getAddressesAPI, 
  setDefaultAddressAPI, 
  updateAddressAPI 
} from '~/apiRequests/user.apiRequest'
import { toast } from 'sonner'
import provinceData from '~/lib/province_and_ward.json'

interface Ward {
  ward_code: string
  name: string
  province_code: string
}

interface Province {
  province_code: string
  name: string
  short_name: string
  code: string
  place_type: string
  wards: Ward[]
}

export interface Address {
  id: string
  userId: string
  recipientName: string
  recipientPhoneNumber: string
  province: string
  ward: string
  detail: string
  isDefault: boolean
  createdAt?: Date  
  updatedAt?: Date 
}

export default function AddressManagement() {
  const [addresses, setAddresses] = useState<Address[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [editingAddress, setEditingAddress] = useState<Address | null>(null)
  const [isAdding, setIsAdding] = useState(false)
  
  // State cho form thêm địa chỉ
  const [addSelectedProvince, setAddSelectedProvince] = useState<string>('')
  const [addWards, setAddWards] = useState<Ward[]>([])
  
  // State cho form chỉnh sửa địa chỉ  
  const [editSelectedProvince, setEditSelectedProvince] = useState<string>('')
  const [editWards, setEditWards] = useState<Ward[]>([])

  const user = useBoundStore((state) => state.user)
  
  const editForm = useForm<Address>()
  const addForm = useForm<Address>()
  
  // Memoize provinces list
  const provinces = useMemo(() => provinceData as Province[], [])

  // Fetch addresses from backend
  useEffect(() => {
    if (!user) return
    
    const fetchAddresses = async () => {
      try {
        setIsLoading(true)

        const response = await getAddressesAPI(user.id)
        setAddresses(response.data)
      } catch {
        toast.error('Không thể tải địa chỉ, xin lỗi vì sự bất tiện này!')
      } finally {
        setIsLoading(false)
      }
    }

    fetchAddresses()
  }, [user])

  // Early return if user not loaded
  if (!user) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="text-muted-foreground">Đang tải...</div>
      </div>
    )
  }

  const handleSetDefault = async (id: string) => {
    setAddresses(addresses.map(addr => ({
      ...addr,
      isDefault: addr.id === id
    })))
    await setDefaultAddressAPI(id)
  }

  const handleDelete = async (id: string) => {
    setAddresses(prevAddresses => prevAddresses.filter(address => address.id !== id))
    await deleteAddressAPI(id)
  }

  const handleEdit = (address: Address) => {
    setEditingAddress(address)
    editForm.reset(address)
    // Thiết lập tỉnh và danh sách ward cho form chỉnh sửa
    setEditSelectedProvince(address.province)
    const selectedProvince = provinces.find(p => p.name === address.province)
    if (selectedProvince) {
      setEditWards(selectedProvince.wards)
    } else {
      setEditWards([])
    }
  }

  const handleAdd = () => {
    setIsAdding(true)
    setAddSelectedProvince('')
    setAddWards([])
    addForm.reset({
      recipientName: '',
      recipientPhoneNumber: '',
      province: '',
      ward: '',
      detail: '',
      isDefault: false
    })
  }
  
  // Xử lý khi chọn tỉnh trong form thêm
  const handleAddProvinceChange = (provinceName: string) => {
    setAddSelectedProvince(provinceName)
    const selectedProvince = provinces.find(p => p.name === provinceName)
    if (selectedProvince) {
      setAddWards(selectedProvince.wards)
    } else {
      setAddWards([])
    }
    addForm.setValue('province', provinceName)
    addForm.setValue('ward', '') // Reset ward khi đổi tỉnh
  }
  
  // Xử lý khi chọn tỉnh trong form chỉnh sửa
  const handleEditProvinceChange = (provinceName: string) => {
    setEditSelectedProvince(provinceName)
    const selectedProvince = provinces.find(p => p.name === provinceName)
    if (selectedProvince) {
      setEditWards(selectedProvince.wards)
    } else {
      setEditWards([])
    }
    editForm.setValue('province', provinceName)
    editForm.setValue('ward', '') // Reset ward khi đổi tỉnh
  }

  const onSubmitEdit = async (data: Omit<Address, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => {
    if (!editingAddress) return

    // Chỉ lấy những trường cần thiết
    const { recipientName, recipientPhoneNumber, province, ward, detail, isDefault } = data
    const updateData = {
      recipientName,
      recipientPhoneNumber,
      province,
      ward,
      detail,
      isDefault
    }

    await updateAddressAPI(editingAddress.id, updateData)
    setAddresses(prevAddresses => 
      prevAddresses.map(addr => 
        addr.id === editingAddress.id 
          ? { ...addr, ...updateData, updatedAt: new Date() }
          : addr
      )
    )
    setEditingAddress(null)
  }

  const onSubmitAdd = async (data: Address) => {
    const newAddress: Address = {
      ...data,
      isDefault: addresses.length === 0
    }

    const response = await addAddressAPI(user?.id, newAddress)
    setAddresses([response.data, ...addresses])
    setIsAdding(false)
  }

  return (
    <div className='bg-white rounded-2xl shadow-lg overflow-hidden'>
      {/* Header */}
      <div className='bg-gradient-to-r from-[#004643] to-[#005d58] p-8'>
        <div className='flex justify-between items-center'>
          <div>
            <h1 className='text-3xl font-bold text-white mb-2'>Quản Lý Địa Chỉ</h1>
            <p className='text-white/80'>Quản lý địa chỉ giao hàng của bạn</p>
          </div>
          <button
            onClick={handleAdd}
            className='bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-lg font-semibold flex items-center gap-2 transition-all hover:shadow-lg border border-white/20'
          >
            <Plus className='w-4 h-4' />
            Thêm địa chỉ mới
          </button>
        </div>
      </div>

      {/* Content */}
      <div className='p-8'>
        {isLoading ? (
          <div className='text-center py-12'>
            <div className='w-16 h-16 border-4 border-[#004643] border-t-transparent rounded-full animate-spin mx-auto mb-4'></div>
            <p className='text-gray-500'>Đang tải địa chỉ...</p>
          </div>
        ) : addresses.length === 0 ? (
          <div className='text-center py-12'>
            <MapPin className='w-16 h-16 text-gray-300 mx-auto mb-4' />
            <p className='text-gray-500 mb-4'>Bạn chưa có địa chỉ nào</p>
          </div>
        ) : (
          <div className='space-y-4'>
            {addresses.map((address) => (
              <div
                key={address.id}
                className='border-2 border-gray-200 rounded-lg p-6 hover:border-[#004643] transition-all'
              >
                <div className='flex justify-between items-start mb-4'>
                  <div className='flex items-center gap-2'>
                    <h3 className='font-bold text-lg text-gray-800'>{address.recipientName}</h3>
                    {address.isDefault && (
                      <span className='bg-gradient-to-r from-[#004643] to-[#005d58] text-white text-xs px-3 py-1 rounded-full font-semibold'>
                        Mặc định
                      </span>
                    )}
                  </div>
                  <div className='flex items-center gap-2'>
                    {!address.isDefault && (
                      <button
                        onClick={() => handleSetDefault(address.id)}
                        className='bg-amber-500 hover:bg-amber-600 text-white px-4 py-2 rounded-lg font-semibold text-sm transition-all'
                      >
                        Đặt làm mặc định
                      </button>
                    )}
                    <button 
                      onClick={() => handleEdit(address)}
                      className='text-blue-600 hover:text-blue-700 p-2 hover:bg-blue-50 rounded-lg transition-all'
                    >
                      <Edit className='w-5 h-5' />
                    </button>
                    <button
                      onClick={() => handleDelete(address.id)}
                      className='text-red-600 hover:text-red-700 p-2 hover:bg-red-50 rounded-lg transition-all'
                    >
                      <Trash2 className='w-5 h-5' />
                    </button>
                  </div>
                </div>

                <div className='space-y-2 text-gray-600'>
                  <div className='flex items-center gap-2'>
                    <Phone className='w-4 h-4 text-[#004643]' />
                    <span>{address.recipientPhoneNumber}</span>
                  </div>
                  <div className='flex items-start gap-2'>
                    <MapPin className='w-4 h-4 text-[#004643] mt-1' />
                    <span>
                      {address.detail}, {address.ward}, {address.province}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add Modal */}
      {isAdding && (
        <div className='fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50'>
          <div className='bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto'>
            <div className='bg-gradient-to-r from-[#004643] to-[#005d58] p-6 flex justify-between items-center'>
              <h2 className='text-2xl font-bold text-white'>Thêm địa chỉ mới</h2>
              <button
                onClick={() => setIsAdding(false)}
                className='text-white hover:bg-white/10 p-2 rounded-lg transition-all'
              >
                <X className='w-6 h-6' />
              </button>
            </div>

            <div className='p-6 space-y-4'>
              <div>
                <label className='block text-sm font-semibold text-gray-700 mb-2'>
                  Tên người nhận <span className='text-red-500'>*</span>
                </label>
                <input
                  {...addForm.register('recipientName', { required: 'Vui lòng nhập tên người nhận' })}
                  className=' text-gray-600 w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-[#004643] focus:outline-none transition-all'
                  placeholder='Nhập tên người nhận'
                />
                {addForm.formState.errors.recipientName && (
                  <p className='text-red-500 text-sm mt-1'>{addForm.formState.errors.recipientName.message}</p>
                )}
              </div>

              <div>
                <label className='block text-sm font-semibold text-gray-700 mb-2'>
                  Số điện thoại <span className='text-red-500'>*</span>
                </label>
                <input
                  {...addForm.register('recipientPhoneNumber', { 
                    required: 'Vui lòng nhập số điện thoại',
                    pattern: {
                      value: /^[0-9]{10}$/,
                      message: 'Số điện thoại không hợp lệ'
                    }
                  })}
                  className='text-gray-600 w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-[#004643] focus:outline-none transition-all'
                  placeholder='Nhập số điện thoại'
                />
                {addForm.formState.errors.recipientPhoneNumber && (
                  <p className='text-red-500 text-sm mt-1'>{addForm.formState.errors.recipientPhoneNumber.message}</p>
                )}
              </div>

              <div>
                <label className='block text-sm font-semibold text-gray-700 mb-2'>
                  Tỉnh/Thành phố <span className='text-red-500'>*</span>
                </label>
                <select
                  value={addSelectedProvince}
                  onChange={(e) => handleAddProvinceChange(e.target.value)}
                  className='text-gray-600 w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-[#004643] focus:outline-none transition-all bg-white'
                >
                  <option value=''>Chọn tỉnh/thành phố</option>
                  {provinces.map((province) => (
                    <option key={province.province_code} value={province.name}>
                      {province.name}
                    </option>
                  ))}
                </select>
                <input type='hidden' {...addForm.register('province', { required: 'Vui lòng chọn tỉnh/thành phố' })} />
                {addForm.formState.errors.province && (
                  <p className='text-red-500 text-sm mt-1'>{addForm.formState.errors.province.message}</p>
                )}
              </div>

              <div>
                <label className='block text-sm font-semibold text-gray-700 mb-2'>
                  Phường/Xã <span className='text-red-500'>*</span>
                </label>
                <select
                  {...addForm.register('ward', { required: 'Vui lòng chọn phường/xã' })}
                  className='text-gray-600 w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-[#004643] focus:outline-none transition-all bg-white'
                  disabled={!addSelectedProvince}
                >
                  <option value=''>Chọn phường/xã</option>
                  {addWards.map((ward) => (
                    <option key={ward.ward_code} value={ward.name}>
                      {ward.name}
                    </option>
                  ))}
                </select>
                {addForm.formState.errors.ward && (
                  <p className='text-red-500 text-sm mt-1'>{addForm.formState.errors.ward.message}</p>
                )}
              </div>

              <div>
                <label className='block text-sm font-semibold text-gray-700 mb-2'>
                  Địa chỉ chi tiết <span className='text-red-500'>*</span>
                </label>
                <input
                  {...addForm.register('detail', { required: 'Vui lòng nhập địa chỉ chi tiết' })}
                  className='text-gray-600 w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-[#004643] focus:outline-none transition-all'
                  placeholder='Số nhà, tên đường'
                />
                {addForm.formState.errors.detail && (
                  <p className='text-red-500 text-sm mt-1'>{addForm.formState.errors.detail.message}</p>
                )}
              </div>

              <div className='flex gap-3 pt-4'>
                <button
                  type='button'
                  onClick={() => setIsAdding(false)}
                  className='flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-all'
                >
                  Hủy
                </button>
                <button
                  type='button'
                  onClick={addForm.handleSubmit(onSubmitAdd)}
                  className='flex-1 px-6 py-3 bg-gradient-to-r from-[#004643] to-[#005d58] text-white rounded-lg font-semibold hover:shadow-lg transition-all'
                >
                  Thêm địa chỉ
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {editingAddress && (
        <div className='fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50'>
          <div className='bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto'>
            <div className='bg-gradient-to-r from-[#e16162] to-[#d85456] p-6 flex justify-between items-center'>
              <h2 className='text-2xl font-bold text-white'>Chỉnh sửa địa chỉ</h2>
              <button
                onClick={() => setEditingAddress(null)}
                className='text-white hover:bg-white/10 p-2 rounded-lg transition-all'
              >
                <X className='w-6 h-6' />
              </button>
            </div>

            <div className='p-6 space-y-4'>
              <div>
                <label className='block text-sm font-semibold text-gray-700 mb-2'>
                  Tên người nhận <span className='text-red-500'>*</span>
                </label>
                <input
                  {...editForm.register('recipientName', { required: 'Vui lòng nhập tên người nhận' })}
                  className='text-gray-600 w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-[#e16162] focus:outline-none transition-all'
                  placeholder='Nhập tên người nhận'
                />
                {editForm.formState.errors.recipientName && (
                  <p className='text-red-500 text-sm mt-1'>{editForm.formState.errors.recipientName.message}</p>
                )}
              </div>

              <div>
                <label className='block text-sm font-semibold text-gray-700 mb-2'>
                  Số điện thoại <span className='text-red-500'>*</span>
                </label>
                <input
                  {...editForm.register('recipientPhoneNumber', { 
                    required: 'Vui lòng nhập số điện thoại',
                    pattern: {
                      value: /^[0-9]{10}$/,
                      message: 'Số điện thoại không hợp lệ'
                    }
                  })}
                  className='text-gray-600 w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-600 focus:outline-none transition-all'
                  placeholder='Nhập số điện thoại'
                />
                {editForm.formState.errors.recipientPhoneNumber && (
                  <p className='text-red-500 text-sm mt-1'>{editForm.formState.errors.recipientPhoneNumber.message}</p>
                )}
              </div>

              <div>
                <label className='block text-sm font-semibold text-gray-700 mb-2'>
                  Tỉnh/Thành phố <span className='text-red-500'>*</span>
                </label>
                <select
                  value={editSelectedProvince}
                  onChange={(e) => handleEditProvinceChange(e.target.value)}
                  className='text-gray-600 w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-[#e16162] focus:outline-none transition-all bg-white'
                >
                  <option value=''>Chọn tỉnh/thành phố</option>
                  {provinces.map((province) => (
                    <option key={province.province_code} value={province.name}>
                      {province.name}
                    </option>
                  ))}
                </select>
                <input type='hidden' {...editForm.register('province', { required: 'Vui lòng chọn tỉnh/thành phố' })} />
                {editForm.formState.errors.province && (
                  <p className='text-red-500 text-sm mt-1'>{editForm.formState.errors.province.message}</p>
                )}
              </div>

              <div>
                <label className='block text-sm font-semibold text-gray-700 mb-2'>
                  Phường/Xã <span className='text-red-500'>*</span>
                </label>
                <select
                  {...editForm.register('ward', { required: 'Vui lòng chọn phường/xã' })}
                  className='text-gray-600 w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-[#e16162] focus:outline-none transition-all bg-white'
                  disabled={!editSelectedProvince}
                >
                  <option value=''>Chọn phường/xã</option>
                  {editWards.map((ward) => (
                    <option key={ward.ward_code} value={ward.name}>
                      {ward.name}
                    </option>
                  ))}
                </select>
                {editForm.formState.errors.ward && (
                  <p className='text-red-500 text-sm mt-1'>{editForm.formState.errors.ward.message}</p>
                )}
              </div>

              <div>
                <label className='block text-sm font-semibold text-gray-700 mb-2'>
                  Địa chỉ chi tiết <span className='text-red-500'>*</span>
                </label>
                <input
                  {...editForm.register('detail', { required: 'Vui lòng nhập địa chỉ chi tiết' })}
                  className='text-gray-600 w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-600 focus:outline-none transition-all'
                  placeholder='Số nhà, tên đường'
                />
                {editForm.formState.errors.detail && (
                  <p className='text-red-500 text-sm mt-1'>{editForm.formState.errors.detail.message}</p>
                )}
              </div>

              <div className='flex gap-3 pt-4'>
                <button
                  type='button'
                  onClick={() => setEditingAddress(null)}
                  className='flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-all'
                >
                  Hủy
                </button>
                <button
                  type='button'
                  onClick={editForm.handleSubmit(onSubmitEdit)}
                  className='flex-1 px-6 py-3 bg-gradient-to-r from-[#e16162] to-[#d85456] text-white rounded-lg font-semibold hover:shadow-lg transition-all'
                >
                  Lưu thay đổi
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}