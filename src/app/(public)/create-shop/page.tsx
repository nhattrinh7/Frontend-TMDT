'use client'

import { useState, useEffect, useMemo } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import * as z from 'zod'
import { Button } from '~/components/ui/button'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '~/components/ui/form'
import { Input } from '~/components/ui/input'
import { Textarea } from '~/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '~/components/ui/select'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '~/components/ui/card'
import { Loader2, Plus, MapPin, Phone, X, Check } from 'lucide-react'
import { BankEnum } from '~/zodSchema/shop.schema'
import { Address } from '~/app/(private)/profile/AddressManagement'
import { getAddressesAPI, addAddressAPI } from '~/apiRequests/user.apiRequest'
import { getRootCategoriesAPI } from '~/apiRequests/category.apiRequest'
import { Category } from '~/zodSchema/category.schema'
import { useBoundStore } from '~/zustand/store'
import { toast } from 'sonner'
import { createShopAPI, checkUserHasShopAPI } from '~/apiRequests/shop.apiRequest'
import { useRouter } from 'next/navigation'
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

const formSchema = z.object({
  name: z.string().min(1, 'Tên shop là bắt buộc').max(50, 'Tên shop tối đa 50 ký tự'),
  description: z.string().min(1, 'Mô tả là bắt buộc').max(200, 'Mô tả tối đa 200 ký tự'),
  categoryId: z.string().min(1, 'Vui lòng chọn ngành hàng'),
  bankName: BankEnum,
  bankNumber: z.string().min(6, 'Số tài khoản tối thiểu 6 chữ số').regex(/^\d+$/, 'Chỉ được nhập số'),
  taxCode: z.string().min(10, 'Mã số thuế tối thiểu 10 chữ số').regex(/^\d+$/, 'Chỉ được nhập số'),
})

const BANK_LABELS: Record<z.infer<typeof BankEnum>, string> = {
  VIETCOMBANK: 'Vietcombank',
  BIDV: 'BIDV',
  VIETINBANK: 'Vietinbank',
  AGRIBANK: 'Agribank',
  VPBANK: 'VPBank',
  TECHCOMBANK: 'Techcombank',
  MB: 'MB Bank',
  SACOMBANK: 'Sacombank',
  ACB: 'ACB',
  HDBANK: 'HDBank',
  TPBANK: 'TPBank',
  SHB: 'SHB',
  VIB: 'VIB',
}

export default function CreateShopForm() {
  const [addresses, setAddresses] = useState<Address[]>([])
  const [selectedAddressId, setSelectedAddressId] = useState<string>('')
  const [isLoadingAddress, setIsLoadingAddress] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [rootCategories, setRootCategories] = useState<Category[]>([])
  const [isLoadingCategories, setIsLoadingCategories] = useState(true)
  
  // State cho modal thêm địa chỉ mới
  const [isAddingAddress, setIsAddingAddress] = useState(false)
  const [addSelectedProvince, setAddSelectedProvince] = useState<string>('')
  const [addWards, setAddWards] = useState<Ward[]>([])

  const router = useRouter()
  const user = useBoundStore((state) => state.user)
  
  // Memoize provinces list
  const provinces = useMemo(() => provinceData as Province[], [])
  
  // Form cho thêm địa chỉ mới
  const addAddressForm = useForm<Address>()

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      description: '',
      categoryId: '',
      bankName: undefined,
      bankNumber: '',
      taxCode: '',
    },
  })

  useEffect(() => {
    // Redirect to login if not authenticated
    if (!user) {
      router.push('/login')
      return
    }

    // Check nếu đã có shop → redirect sang trang pending (trang pending tự xử lý redirect tiếp)
    const checkExistingShop = async () => {
      try {
        const response = await checkUserHasShopAPI()
        if (response.data.hasShop) {
          router.push('/shop-pending')
          return
        }
      } catch {
        // Ignore error, cho phép tiếp tục form
      }
    }

    const fetchAddresses = async () => {
      try {
        const response = await getAddressesAPI(user.id)
        setAddresses(response.data)
        // Tự động chọn địa chỉ mặc định nếu có
        const defaultAddr = response.data.find((addr: Address) => addr.isDefault)
        if (defaultAddr) {
          setSelectedAddressId(defaultAddr.id)
        } else if (response.data.length > 0) {
          setSelectedAddressId(response.data[0].id)
        }
      } catch {
        toast.error('Không tải được địa chỉ, vui lòng thử lại sau')
      } finally {
        setIsLoadingAddress(false)
      }
    }

    const fetchRootCategories = async () => {
      try {
        const response = await getRootCategoriesAPI()
        setRootCategories(response.data)
      } catch {
        toast.error('Không tải được danh sách ngành hàng, vui lòng thử lại sau')
      } finally {
        setIsLoadingCategories(false)
      }
    }

    checkExistingShop()
    fetchAddresses()
    fetchRootCategories()
  }, [user, router])

  // Show loading while checking authentication
  if (!user) {
    return (
      <div className="container max-w-4xl mx-auto py-8 px-4">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </div>
    )
  }
  
  // Xử lý khi chọn tỉnh trong form thêm địa chỉ
  const handleAddProvinceChange = (provinceName: string) => {
    setAddSelectedProvince(provinceName)
    const selectedProvince = provinces.find(p => p.name === provinceName)
    if (selectedProvince) {
      setAddWards(selectedProvince.wards)
    } else {
      setAddWards([])
    }
    addAddressForm.setValue('province', provinceName)
    addAddressForm.setValue('ward', '')
  }
  
  // Mở modal thêm địa chỉ mới
  const handleOpenAddAddress = () => {
    setIsAddingAddress(true)
    setAddSelectedProvince('')
    setAddWards([])
    addAddressForm.reset({
      recipientName: '',
      recipientPhoneNumber: '',
      province: '',
      ward: '',
      detail: '',
      isDefault: false
    })
  }
  
  // Submit thêm địa chỉ mới
  const onSubmitAddAddress = async (data: Address) => {
    try {
      const newAddress: Address = {
        ...data,
        isDefault: addresses.length === 0
      }
      const response = await addAddressAPI(user?.id, newAddress)
      setAddresses([response.data, ...addresses])
      setSelectedAddressId(response.data.id)
      setIsAddingAddress(false)
      toast.success('Thêm địa chỉ thành công')
    } catch {
      toast.error('Không thể thêm địa chỉ')
    }
  }

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (!selectedAddressId) {
      toast.error('Vui lòng chọn hoặc thêm địa chỉ cho shop')
      return
    }
    
    setIsSubmitting(true)
    try {
      const dataToCreate = { ...values, addressId: selectedAddressId }
      await createShopAPI(dataToCreate)
      toast.success('Đăng kí thành công, kết quả phê duyệt sẽ được gửi vào email của bạn')
      router.push('/shop-pending')
    } catch (error) {
      toast.error('Lỗi khi đăng kí, xem lại thông tin hoặc thử lại sau')
    } finally {
      setIsSubmitting(false)
    } 
  }
  
  return (
    <div className="container max-w-4xl mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-8" style={{ color: '#004643' }}>
        Tạo shop - trở thành nhà bán hàng
      </h1>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          {/* Thông tin shop */}
          <Card>
            <CardHeader>
              <CardTitle style={{ color: '#004643' }}>Thông tin shop</CardTitle>
              <CardDescription>Điền đầy đủ thông tin về shop của bạn</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tên shop</FormLabel>
                    <FormControl>
                      <Input placeholder="Nhập tên shop" {...field} maxLength={50} />
                    </FormControl>
                    <FormDescription>{field.value.length}/50 ký tự</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Mô tả shop</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Nhập mô tả về shop của bạn"
                        {...field}
                        maxLength={200}
                        rows={4}
                      />
                    </FormControl>
                    <FormDescription>{field.value.length}/200 ký tự</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="categoryId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Ngành hàng</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder={isLoadingCategories ? 'Đang tải...' : 'Chọn ngành hàng'} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {rootCategories.map((category) => (
                          <SelectItem key={category.id} value={category.id}>
                            {category.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Địa chỉ shop */}
              <div className="space-y-3">
                <FormLabel>Địa chỉ shop <span className="text-red-500">*</span></FormLabel>
                
                {isLoadingAddress ? (
                  <div className="flex items-center gap-2 p-4 bg-gray-50 rounded-md border">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span className="text-sm text-gray-600">Đang tải địa chỉ...</span>
                  </div>
                ) : addresses.length === 0 ? (
                  <div className="p-4 bg-gray-50 rounded-md border text-center">
                    <MapPin className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                    <p className="text-sm text-gray-600 mb-3">Bạn chưa có địa chỉ nào</p>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleOpenAddAddress}
                      className="gap-2"
                    >
                      <Plus className="w-4 h-4" />
                      Thêm địa chỉ mới
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {addresses.map((address) => (
                      <div
                        key={address.id}
                        onClick={() => setSelectedAddressId(address.id)}
                        className={`p-4 rounded-md border-2 cursor-pointer transition-all ${
                          selectedAddressId === address.id
                            ? 'border-[#004643] bg-[#004643]/5'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-medium text-gray-800">{address.recipientName}</span>
                              {address.isDefault && (
                                <span className="text-xs px-2 py-0.5 bg-[#004643] text-white rounded">
                                  Mặc định
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-1 text-sm text-gray-600 mb-1">
                              <Phone className="w-3 h-3" />
                              {address.recipientPhoneNumber}
                            </div>
                            <div className="flex items-start gap-1 text-sm text-gray-600">
                              <MapPin className="w-3 h-3 mt-0.5 shrink-0" />
                              <span>{address.detail}, {address.ward}, {address.province}</span>
                            </div>
                          </div>
                          {selectedAddressId === address.id && (
                            <Check className="w-5 h-5 text-[#004643]" />
                          )}
                        </div>
                      </div>
                    ))}
                    
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleOpenAddAddress}
                      className="w-full gap-2 mt-2"
                    >
                      <Plus className="w-4 h-4" />
                      Thêm địa chỉ mới
                    </Button>
                  </div>
                )}
                
                <FormDescription>
                  Chọn địa chỉ làm địa chỉ shop của bạn
                </FormDescription>
              </div>
            </CardContent>
          </Card>

          {/* Tài khoản ngân hàng và thông tin thuế */}
          <Card>
            <CardHeader>
              <CardTitle style={{ color: '#004643' }}>Tài khoản ngân hàng và thông tin thuế</CardTitle>
              <CardDescription>Thông tin để thanh toán và kê khai thuế</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <FormField
                control={form.control}
                name="bankName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Ngân hàng</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Chọn ngân hàng" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {BankEnum.options.map((bank) => (
                          <SelectItem key={bank} value={bank}>
                            {BANK_LABELS[bank]}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="bankNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Số tài khoản</FormLabel>
                    <FormControl>
                      <Input placeholder="Nhập số tài khoản" {...field} />
                    </FormControl>
                    <FormDescription>Tối thiểu 6 chữ số</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="taxCode"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Mã số thuế</FormLabel>
                    <FormControl>
                      <Input placeholder="Nhập mã số thuế" {...field} />
                    </FormControl>
                    <FormDescription>Tối thiểu 10 chữ số</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          <Button
            type="submit"
            className="w-full text-white hover:opacity-90"
            style={{ backgroundColor: '#004643' }}
            disabled={isSubmitting || !selectedAddressId}
            size="lg"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Đang tạo shop...
              </>
            ) : (
              'Tạo shop'
            )}
          </Button>
        </form>
      </Form>
      
      {/* Modal thêm địa chỉ mới */}
      {isAddingAddress && (
        <div className='fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50'>
          <div className='bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto'>
            <div className='bg-linear-to-r from-[#004643] to-[#005d58] p-6 flex justify-between items-center'>
              <h2 className='text-2xl font-bold text-white'>Thêm địa chỉ mới</h2>
              <button
                onClick={() => setIsAddingAddress(false)}
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
                  {...addAddressForm.register('recipientName', { required: 'Vui lòng nhập tên người nhận' })}
                  className='text-gray-600 w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-[#004643] focus:outline-none transition-all'
                  placeholder='Nhập tên người nhận'
                />
                {addAddressForm.formState.errors.recipientName && (
                  <p className='text-red-500 text-sm mt-1'>{addAddressForm.formState.errors.recipientName.message}</p>
                )}
              </div>

              <div>
                <label className='block text-sm font-semibold text-gray-700 mb-2'>
                  Số điện thoại <span className='text-red-500'>*</span>
                </label>
                <input
                  {...addAddressForm.register('recipientPhoneNumber', { 
                    required: 'Vui lòng nhập số điện thoại',
                    pattern: {
                      value: /^[0-9]{10}$/,
                      message: 'Số điện thoại không hợp lệ'
                    }
                  })}
                  className='text-gray-600 w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-[#004643] focus:outline-none transition-all'
                  placeholder='Nhập số điện thoại'
                />
                {addAddressForm.formState.errors.recipientPhoneNumber && (
                  <p className='text-red-500 text-sm mt-1'>{addAddressForm.formState.errors.recipientPhoneNumber.message}</p>
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
                <input type='hidden' {...addAddressForm.register('province', { required: 'Vui lòng chọn tỉnh/thành phố' })} />
                {addAddressForm.formState.errors.province && (
                  <p className='text-red-500 text-sm mt-1'>{addAddressForm.formState.errors.province.message}</p>
                )}
              </div>

              <div>
                <label className='block text-sm font-semibold text-gray-700 mb-2'>
                  Phường/Xã <span className='text-red-500'>*</span>
                </label>
                <select
                  {...addAddressForm.register('ward', { required: 'Vui lòng chọn phường/xã' })}
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
                {addAddressForm.formState.errors.ward && (
                  <p className='text-red-500 text-sm mt-1'>{addAddressForm.formState.errors.ward.message}</p>
                )}
              </div>

              <div>
                <label className='block text-sm font-semibold text-gray-700 mb-2'>
                  Địa chỉ chi tiết <span className='text-red-500'>*</span>
                </label>
                <input
                  {...addAddressForm.register('detail', { required: 'Vui lòng nhập địa chỉ chi tiết' })}
                  className='text-gray-600 w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-[#004643] focus:outline-none transition-all'
                  placeholder='Số nhà, tên đường'
                />
                {addAddressForm.formState.errors.detail && (
                  <p className='text-red-500 text-sm mt-1'>{addAddressForm.formState.errors.detail.message}</p>
                )}
              </div>

              <div className='flex gap-3 pt-4'>
                <button
                  type='button'
                  onClick={() => setIsAddingAddress(false)}
                  className='flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-all'
                >
                  Hủy
                </button>
                <button
                  type='button'
                  onClick={addAddressForm.handleSubmit(onSubmitAddAddress)}
                  className='flex-1 px-6 py-3 bg-linear-to-r from-[#004643] to-[#005d58] text-white rounded-lg font-semibold hover:shadow-lg transition-all'
                >
                  Thêm địa chỉ
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}