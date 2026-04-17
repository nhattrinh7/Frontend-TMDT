'use client'

import { useState, useRef, useEffect } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import Image from 'next/image'
import { Camera, User, Phone, Calendar, Users, Save, Loader2, LogOut } from 'lucide-react'
import { useBoundStore } from '~/zustand/store'
import { uploadAvatarAPI, getProfileAPI, updateProfileAPI } from '~/apiRequests/user.apiRequest'
import { toast } from 'sonner'
import { logoutAPI } from '~/apiRequests/auth.apiRequest'
import { useRouter } from 'next/navigation'

// Zod Schema
const profileSchema = z.object({
  username: z
    .string()
    .min(3, 'Tên đăng nhập phải có ít nhất 3 ký tự')
    .max(50, 'Tên đăng nhập không được quá 50 ký tự'),
  fullName: z
    .string()
    .min(1, 'Họ và tên là bắt buộc')
    .max(100, 'Họ và tên không được quá 100 ký tự'),
  phoneNumber: z
    .string()
    .regex(/^[0-9]{10,11}$/, 'Số điện thoại phải có 10-11 chữ số'),
  dob: z
    .string()
    .min(1, 'Ngày sinh là bắt buộc')
    .regex(/^\d{2}\/\d{2}\/\d{4}$/, 'Ngày sinh phải có định dạng dd/mm/yyyy')
    .refine((date) => {
      const [day, month, year] = date.split('/').map(Number)
      const birthDate = new Date(year, month - 1, day)
      const today = new Date()
      const age = today.getFullYear() - birthDate.getFullYear()
      return age >= 13 && age <= 120
    }, 'Tuổi phải từ 13 đến 120'),
  gender: z.enum(['MALE', 'FEMALE', 'OTHER'], {
    message: 'Vui lòng chọn giới tính',
  }),
})

type ProfileFormData = z.infer<typeof profileSchema>

export default function ProfilePage() {
  const user = useBoundStore((state) => state.user)
  const setUser = useBoundStore((state) => state.setUser)
  const logout = useBoundStore((state) => state.clearUser)
  const clearCart = useBoundStore((state) => state.clearCart)
  const clearShop = useBoundStore((state) => state.clearShop)

  const router = useRouter()
  
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingProfile, setIsLoadingProfile] = useState(true)
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false)
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Convert ISO date to dd/mm/yyyy
  const formatDateToDisplay = (isoDate: string) => {
    if (!isoDate) return ''
    const date = new Date(isoDate)
    const day = String(date.getDate()).padStart(2, '0')
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const year = date.getFullYear()
    return `${day}/${month}/${year}`
  }

  // Convert dd/mm/yyyy to ISO date
  const formatDateToISO = (displayDate: string) => {
    if (!displayDate) return ''
    const [day, month, year] = displayDate.split('/').map(Number)
    
    // Tạo Date object (month - 1 vì month trong JS bắt đầu từ 0)
    const date = new Date(year, month - 1, day)
    
    // Trả về ISO-8601 datetime: '2024-12-14T00:00:00.000Z'
    return date.toISOString()
  }

  const {
    register,
    handleSubmit,
    formState: { errors },
    control,
    reset,
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      username: '',
      fullName: '',
      phoneNumber: '',
      dob: '',
      gender: 'OTHER',
    }
  })

  // Fetch user profile khi component mount
  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!user?.id) {
        setIsLoadingProfile(false)
        return
      }

      try {
        setIsLoadingProfile(true)
        const response = await getProfileAPI(user.id)
        
        // Update Zustand store nếu cần
        if (setUser) {
          setUser(response.data)
        }
        
        // Reset form với data mới
        reset({
          username: response.data.username || '',
          fullName: response.data.fullName || '',
          phoneNumber: response.data.phoneNumber || '',
          dob: response.data.dob ? formatDateToDisplay(response.data.dob) : '',
          gender: response.data.gender || 'OTHER',
        })

        // Update avatar
        setAvatarPreview(response.data.avatar || null)
        
      } catch (error) {
        toast.error('Không thể tải thông tin người dùng', {
          description: 'Vui lòng thử lại sau',
        })
      } finally {
        setIsLoadingProfile(false)
      }
    }

    fetchUserProfile()
  }, [user?.id, reset, setUser])

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Kích thước ảnh không được vượt quá 2MB')
        return
      }

      if (!file.type.startsWith('image/')) {
        toast.error('Vui lòng chọn file ảnh')
        return
      }

      setAvatarFile(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleUpdateAvatar = async () => {
    if (!avatarFile || !user?.id) return
    
    setIsUploadingAvatar(true)
    try {
      const formData = new FormData()
      formData.append('avatar', avatarFile)

      const response = await uploadAvatarAPI(user.id, formData)

      if (!response) {
        toast.error('Có lỗi khi update avatar!', {
          description: 'Vui lòng thử lại sau',
        })
        return
      }

      toast.success('Cập nhật ảnh đại diện thành công!')
      setAvatarFile(null)
      
      // Update Zustand store với avatar mới
      if (setUser && user) {
        setUser({ ...user, avatar: avatarPreview })
      }
    } catch (error) {
      toast.error('Có lỗi xảy ra khi cập nhật ảnh đại diện')
    } finally {
      setIsUploadingAvatar(false)
    }
  }

  const handleLogout = async () => {
    setIsLoggingOut(true)
    try {
      localStorage.removeItem('accessToken')
      localStorage.removeItem('refreshToken')
      logout()
      clearShop()
      clearCart()

      await logoutAPI()
      
      toast.success('Đăng xuất thành công!')
      router.push('/login')
    } catch (error) {
      toast.error('Có lỗi xảy ra khi đăng xuất')
    } finally {
      setIsLoggingOut(false)
    }
  }

  const onSubmit = async (data: ProfileFormData) => {
    
    setIsLoading(true)
    try {
      if (!user) {
        toast.error('Thông tin người dùng không tìm thấy')
        return
      }

      const isoDate = formatDateToISO(data.dob)
      const dataToUpdate = {
        ...data, 
        dob: isoDate
      }
      
      const response = await updateProfileAPI(user.id, dataToUpdate)

      if (setUser) {
        setUser(response.data)
      }
      
      toast.success('Cập nhật thông tin thành công!')
    } catch (error) {
      toast.error('Có lỗi xảy ra khi cập nhật thông tin')
    } finally {
      setIsLoading(false)
    }
  }

  const getInitials = (name: string) => {
    return name?.charAt(0).toUpperCase() || 'U'
  }

  // Loading state
  if (isLoadingProfile) {
    return (
      <div className='min-h-screen bg-linear-to-br from-gray-50 to-gray-100 flex items-center justify-center'>
        <div className='text-center'>
          <Loader2 className='w-12 h-12 animate-spin text-[#004643] mx-auto mb-4' />
          <p className='text-gray-600'>Đang tải thông tin...</p>
        </div>
      </div>
    )
  }

  return (
    <div className='sm:px-6 lg:px-8'>
      {/* Header */}
      <div className='bg-linear-to-r from-[#004643] to-[#005d58] rounded-t-2xl p-8 shadow-lg'>
        <div className='flex justify-between items-start'>
          <div>
            <h1 className='text-3xl font-bold text-white mb-2'>Thông Tin Cá Nhân</h1>
            <p className='text-white/80'>Quản lý và cập nhật thông tin của bạn</p>
          </div>
          <button
            onClick={handleLogout}
            disabled={isLoggingOut}
            className='bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-lg font-semibold flex items-center gap-2 transition-all hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed border border-white/20'
          >
            {isLoggingOut ? (
              <>
                <Loader2 className='w-4 h-4 animate-spin' />
                Đang xuất...
              </>
            ) : (
              <>
                <LogOut className='w-4 h-4' />
                Đăng xuất
              </>
            )}
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className='bg-white rounded-b-2xl shadow-lg p-8'>
        <form onSubmit={handleSubmit(onSubmit)} className='space-y-8'>
          {/* Avatar Section */}
          <div className='flex flex-col items-center'>
            <div className='relative group'>
              <div className='relative w-32 h-32 rounded-full overflow-hidden border-4 border-[#004643] shadow-xl'>
                {avatarPreview ? (
                  <Image
                    src={avatarPreview}
                    alt='Avatar'
                    fill
                    className='object-cover'
                  />
                ) : (
                  <div className='w-full h-full bg-linear-to-br from-[#004643] to-[#005d58] flex items-center justify-center'>
                    <span className='text-white text-4xl font-bold'>
                      {getInitials(user?.username || 'User')}
                    </span>
                  </div>
                )}
              </div>
              <button
                type='button'
                onClick={() => fileInputRef.current?.click()}
                className='absolute bottom-0 right-0 bg-[#004643] hover:bg-[#005d58] text-white p-3 rounded-full shadow-lg transition-all transform hover:scale-110'
              >
                <Camera className='w-5 h-5' />
              </button>
              <input
                ref={fileInputRef}
                type='file'
                accept='image/*'
                onChange={handleAvatarChange}
                className='hidden'
              />
            </div>
            <p className='mt-4 text-sm text-gray-500'>
              Click vào biểu tượng camera để thay đổi ảnh đại diện (tối đa 2MB)
            </p>
            
            {avatarFile && (
              <button
                type='button'
                onClick={handleUpdateAvatar}
                disabled={isUploadingAvatar}
                className='mt-4 bg-linear-to-r from-[#004643] to-[#005d58] hover:from-[#005d58] hover:to-[#004643] text-white px-6 py-2 rounded-lg font-semibold flex items-center gap-2 shadow-md hover:shadow-lg transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none'
              >
                {isUploadingAvatar ? (
                  <>
                    <Loader2 className='w-4 h-4 animate-spin' />
                    Đang cập nhật...
                  </>
                ) : (
                  <>
                    <Camera className='w-4 h-4' />
                    Cập nhật ảnh đại diện
                  </>
                )}
              </button>
            )}
          </div>

          {/* Form Fields */}
          <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
            {/* Username */}
            <div>
              <label className='block text-sm font-semibold text-gray-700 mb-2'>
                <User className='w-4 h-4 inline mr-2 text-[#004643]' />
                Tên đăng nhập
              </label>
              <Controller
                name='username'
                control={control}
                render={({ field }) => (
                  <input
                    {...field}
                    className=' text-gray-900 w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-[#004643] focus:outline-none transition-colors'
                    placeholder='Nhập tên đăng nhập'
                  />
                )}
              />
              {errors.username && (
                <p className='mt-1 text-sm text-red-500'>{errors.username.message}</p>
              )}
            </div>

            {/* Full Name */}
            <div>
              <label className='block text-sm font-semibold text-gray-700 mb-2'>
                <User className='w-4 h-4 inline mr-2 text-[#004643]' />
                Họ và tên
              </label>
              <Controller
                name='fullName'
                control={control}
                render={({ field }) => (
                  <input
                    {...field}
                    className=' text-gray-900 w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-[#004643] focus:outline-none transition-colors'
                    placeholder='Nhập họ và tên'
                  />
                )}
              />
              {errors.fullName && (
                <p className='mt-1 text-sm text-red-500'>{errors.fullName.message}</p>
              )}
            </div>

            {/* Phone Number */}
            <div>
              <label className='block text-sm font-semibold text-gray-700 mb-2'>
                <Phone className='w-4 h-4 inline mr-2 text-[#004643]' />
                Số điện thoại
              </label>
              <Controller
                name='phoneNumber'
                control={control}
                render={({ field }) => (
                  <input
                    {...field}
                    className=' text-gray-900 w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-[#004643] focus:outline-none transition-colors'
                    placeholder='Nhập số điện thoại'
                  />
                )}
              />
              {errors.phoneNumber && (
                <p className='mt-1 text-sm text-red-500'>{errors.phoneNumber.message}</p>
              )}
            </div>

            {/* Date of Birth */}
            <div>
              <label className='block text-sm font-semibold text-gray-700 mb-2'>
                <Calendar className='w-4 h-4 inline mr-2 text-[#004643]' />
                Ngày sinh
              </label>
              <Controller
                name='dob'
                control={control}
                render={({ field }) => (
                  <input
                    {...field}
                    type='text'
                    placeholder='dd/mm/yyyy'
                    className='text-gray-900 w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-[#004643] focus:outline-none transition-colors'
                    maxLength={10}
                    onChange={(e) => {
                      const input = e.target.value
                      
                      // Chỉ lấy số
                      const numbersOnly = input.replace(/\D/g, '')
                      
                      // Format thành dd/mm/yyyy
                      let formatted = numbersOnly
                      if (numbersOnly.length >= 5) {
                        formatted = numbersOnly.slice(0, 2) + '/' + numbersOnly.slice(2, 4) + '/' + numbersOnly.slice(4, 8)
                      } else if (numbersOnly.length >= 3) {
                        formatted = numbersOnly.slice(0, 2) + '/' + numbersOnly.slice(2, 4)
                      } else if (numbersOnly.length >= 1) {
                        formatted = numbersOnly.slice(0, 2)
                      }
                      
                      // Update form value
                      field.onChange(formatted)
                    }}
                  />
                )}
              />
              {errors.dob && (
                <p className='mt-1 text-sm text-red-500'>{errors.dob.message}</p>
              )}
            </div>

            {/* Gender */}
            <div className='md:col-span-2'>
              <label className='block text-sm font-semibold text-gray-700 mb-3'>
                <Users className='w-4 h-4 inline mr-2 text-[#004643]' />
                Giới tính
              </label>
              <div className='flex gap-4'>
                <label className='flex items-center cursor-pointer group'>
                  <input
                    type='radio'
                    {...register('gender')}
                    value='MALE'
                    className='w-5 h-5 text-[#004643] focus:ring-[#004643] cursor-pointer'
                  />
                  <span className='ml-2 text-gray-700 group-hover:text-[#004643] transition-colors'>
                    Nam
                  </span>
                </label>
                <label className='flex items-center cursor-pointer group'>
                  <input
                    type='radio'
                    {...register('gender')}
                    value='FEMALE'
                    className='w-5 h-5 text-[#004643] focus:ring-[#004643] cursor-pointer'
                  />
                  <span className='ml-2 text-gray-700 group-hover:text-[#004643] transition-colors'>
                    Nữ
                  </span>
                </label>
                <label className='flex items-center cursor-pointer group'>
                  <input
                    type='radio'
                    {...register('gender')}
                    value='OTHER'
                    className='w-5 h-5 text-[#004643] focus:ring-[#004643] cursor-pointer'
                  />
                  <span className='ml-2 text-gray-700 group-hover:text-[#004643] transition-colors'>
                    Khác
                  </span>
                </label>
              </div>
              {errors.gender && (
                <p className='mt-1 text-sm text-red-500'>{errors.gender.message}</p>
              )}
            </div>
          </div>

          {/* Submit Button */}
          <div className='flex justify-end pt-6 border-t border-gray-200'>
            <button
              type='submit'
              disabled={isLoading}
              className='bg-linear-to-r from-[#004643] to-[#005d58] hover:from-[#005d58] hover:to-[#004643] text-white px-8 py-3 rounded-lg font-semibold flex items-center gap-2 shadow-lg hover:shadow-xl transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none'
            >
              {isLoading ? (
                <>
                  <Loader2 className='w-5 h-5 animate-spin' />
                  Đang cập nhật...
                </>
              ) : (
                <>
                  <Save className='w-5 h-5' />
                  Lưu thay đổi
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}