'use client'

import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import Image from 'next/image'
import { Upload, Loader2 } from 'lucide-react'
import { useBoundStore } from '~/zustand/store'

import { Button } from '~/components/ui/button'
import {
  Form,
  FormControl,
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
import { Switch } from '~/components/ui/switch'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '~/components/ui/card'
import { toast } from 'sonner'
import { Address } from '~/app/(private)/profile/AddressManagement'
import { closeShopAPI, toggleShopJoinSaleCampaignAPI, updateShopInfoAPI, updateShopLogoAPI } from '~/apiRequests/shop.apiRequest'
import { getAddressesAPI } from '~/apiRequests/user.apiRequest'
import { BankEnum } from '~/zodSchema/shop.schema'

// Mapping tên ngân hàng để hiển thị
const BANK_NAMES: Record<z.infer<typeof BankEnum>, string> = {
  VIETCOMBANK: 'Vietcombank (Ngân hàng Ngoại thương Việt Nam)',
  BIDV: 'BIDV (Ngân hàng Đầu tư và Phát triển Việt Nam)',
  VIETINBANK: 'VietinBank (Ngân hàng Công thương Việt Nam)',
  AGRIBANK: 'Agribank (Ngân hàng Nông nghiệp và Phát triển Nông thôn)',
  VPBANK: 'VPBank (Ngân hàng Việt Nam Thịnh Vượng)',
  TECHCOMBANK: 'Techcombank (Ngân hàng Kỹ thương Việt Nam)',
  MB: 'MB Bank (Ngân hàng Quân đội)',
  SACOMBANK: 'Sacombank (Ngân hàng TMCP Sài Gòn Thương Tín)',
  ACB: 'ACB (Ngân hàng Á Châu)',
  HDBANK: 'HDBank (Ngân hàng Phát triển Nhà TPHCM)',
  TPBANK: 'TPBank (Ngân hàng Tiên Phong)',
  SHB: 'SHB (Ngân hàng Sài Gòn - Hà Nội)',
  VIB: 'VIB (Ngân hàng Quốc tế)',
}

const shopFormSchema = z.object({
  name: z.string().min(2, 'Tên shop phải có ít nhất 2 ký tự'),
  description: z.string().min(10, 'Mô tả phải có ít nhất 10 ký tự'),
  addressId: z.string().min(1, 'Vui lòng chọn địa chỉ'),
  bankName: BankEnum,
  bankNumber: z.string().min(8, 'Số tài khoản phải có ít nhất 8 ký tự'),
  taxCode: z.string().min(10, 'Mã số thuế phải có ít nhất 10 ký tự').max(14, 'Mã số thuế không hợp lệ'),
})

type ShopFormValues = z.infer<typeof shopFormSchema>


export default function ProfilePage() {
  const user = useBoundStore((state) => state.user)
  const shop = useBoundStore((state) => state.shop)
  const setShop = useBoundStore((state) => state.setShop)
  
  const [logoFile, setLogoFile] = useState<File | null>(null)
  const [logoPreview, setLogoPreview] = useState<string>('')
  const [isUploadingLogo, setIsUploadingLogo] = useState(false)
  const [showLogoSubmit, setShowLogoSubmit] = useState(false)
  
  const [addresses, setAddresses] = useState<Address[]>([])
  const [isLoadingAddresses, setIsLoadingAddresses] = useState(false)
  
  const [isUpdatingSaleCampaign, setIsUpdatingSaleCampaign] = useState(false)
  const [isUpdatingInfo, setIsUpdatingInfo] = useState(false)
  const [isClosingShop, setIsClosingShop] = useState(false)

  const form = useForm<ShopFormValues>({
    resolver: zodResolver(shopFormSchema),
    defaultValues: {
      name: '',
      description: '',
      addressId: '',
      bankName: 'VIETCOMBANK',
      bankNumber: '',
      taxCode: '',
    },
  })

  // Fetch addresses
  useEffect(() => {
    if (!user) return
    
    const fetchAddresses = async () => {
      setIsLoadingAddresses(true)
      try {
        const response = await getAddressesAPI(user.id)
        setAddresses(response.data)
        
        // Tìm địa chỉ mặc định
        const defaultAddress = response.data.find((addr: Address) => addr.isDefault)
        
        // Set địa chỉ mặc định nếu chưa có addressId trong form
        if (defaultAddress && !form.getValues('addressId')) {
          form.setValue('addressId', defaultAddress.id)
        }
      } catch {
        toast.error('Không thể tải danh sách địa chỉ')
      } finally {
        setIsLoadingAddresses(false)
      }
    }
    fetchAddresses()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user])

  // Set form values when shop data được load
  useEffect(() => {
    if (shop) {
      form.reset({
        name: shop.name || '',
        description: shop.description || '',
        addressId: shop.addressId || '',
        bankName: shop.bankName || 'VIETCOMBANK',
        bankNumber: shop.bankNumber || '',
        taxCode: shop.taxCode || '',
      })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shop])

  // Set logo preview when shop data được load
  useEffect(() => {
    if (shop) {
      setLogoPreview(shop.logo || '')
    }
  }, [shop])

  // Show loading if user or shop not loaded
  if (!user || !shop) {
    return (
      <div className='flex h-64 items-center justify-center'>
        <Loader2 className='h-8 w-8 animate-spin text-muted-foreground' />
      </div>
    )
  }

  // Xử lí chọn logo
  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      toast.error('Vui lòng chọn file ảnh')
      return
    }

    if (file.size > 2 * 1024 * 1024) {
      toast.error('Kích thước ảnh không được vượt quá 2MB')
      return
    }

    setLogoFile(file)
    const reader = new FileReader()
    reader.onloadend = () => {
      setLogoPreview(reader.result as string)
      setShowLogoSubmit(true)
    }
    reader.readAsDataURL(file)
  }

  // Submit logo
  const handleLogoSubmit = async () => {
    if (!logoFile) return

    setIsUploadingLogo(true)
    try {
      const formData = new FormData()
      formData.append('logo', logoFile)

      const newShopInfo = await updateShopLogoAPI(shop.id, formData)
      setShop(newShopInfo)
      toast.success('Cập nhật logo thành công')
      
      setShowLogoSubmit(false)
      setLogoFile(null)
    } catch (error) {
      toast.error('Không thể cập nhật logo')
    } finally {
      setIsUploadingLogo(false)
    }
  }

  // Submit cập nhật thông tin shop
  const onSubmit = async (values: ShopFormValues) => {
    setIsUpdatingInfo(true)
    try {
      const newShopInfo = await updateShopInfoAPI(shop.id, values)
      setShop(newShopInfo)
      toast.success('Cập nhật thông tin shop thành công')
    } catch (error) {
      toast.error('Không thể cập nhật thông tin shop')
    } finally {
      setIsUpdatingInfo(false)
    }
  }

  // Bật tắt quyết định tham gia chiến dịch sale
  const handleSaleCampaignToggle = async (checked: boolean) => {
    setIsUpdatingSaleCampaign(true)
    try {
      await toggleShopJoinSaleCampaignAPI(shop.id)

      // Cập nhật vào Zustand store
      setShop({
        ...shop,
        isJoinSaleCampaign: checked
      })
      
      toast.success(
        checked 
          ? 'Đã tham gia chương trình khuyến mãi' 
          : 'Đã rời khỏi chương trình khuyến mãi'
      )
    } catch (error) {
      toast.error('Không thể cập nhật trạng thái chương trình khuyến mãi')
    } finally {
      setIsUpdatingSaleCampaign(false)
    }
  }

  // Đóng shop
  const handleCloseShop = async () => {
    setIsClosingShop(true)
    try {
      const newShopInfo = await closeShopAPI(shop.id)
      setShop(newShopInfo)
      toast.success('Đã đóng shop thành công')
    } catch (error) {
      toast.error('Không thể đóng shop')
    } finally {
      setIsClosingShop(false)
    }
  }

  return (
    <div className='flex flex-col gap-6 p-6'>
      <div className='flex items-center justify-between'>
        <h1 className='text-2xl font-bold text-[#004643]'>Hồ sơ shop</h1>
      </div>

      {/* Logo Section */}
      <Card>
        <CardHeader>
          <CardTitle className='text-[#004643]'>Logo shop</CardTitle>
          <CardDescription>Cập nhật logo cho shop của bạn</CardDescription>
        </CardHeader>
        <CardContent className='space-y-4'>
          <div className='flex items-center gap-6'>
            <div className='relative h-32 w-32 overflow-hidden rounded-lg border-2 border-gray-200'>
              {logoPreview ? (
                <Image
                  src={logoPreview}
                  alt='Shop logo'
                  fill
                  className='object-cover'
                />
              ) : (
                <div className='flex h-full w-full items-center justify-center bg-gray-100'>
                  <Upload className='h-8 w-8 text-gray-400' />
                </div>
              )}
            </div>
            <div className='flex flex-col gap-2'>
              <label htmlFor='logo-upload'>
                <Button
                  type='button'
                  variant='outline'
                  className='cursor-pointer'
                  onClick={() => document.getElementById('logo-upload')?.click()}
                >
                  <Upload className='mr-2 h-4 w-4' />
                  Chọn ảnh
                </Button>
              </label>
              <input
                id='logo-upload'
                type='file'
                accept='image/*'
                className='hidden'
                onChange={handleLogoChange}
              />
              <p className='text-sm text-gray-500'>
                Định dạng: JPG, PNG. Tối đa 2MB
              </p>
            </div>
          </div>
          {showLogoSubmit && (
            <Button
              onClick={handleLogoSubmit}
              disabled={isUploadingLogo}
              className='bg-[#004643] hover:bg-[#003832]'
            >
              {isUploadingLogo ? (
                <>
                  <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                  Đang tải lên...
                </>
              ) : (
                'Xác nhận thay đổi logo'
              )}
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Shop Information Form */}
      <Card>
        <CardHeader>
          <CardTitle className='text-[#004643]'>Thông tin shop</CardTitle>
          <CardDescription>Cập nhật thông tin chi tiết của shop</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-6'>
              <FormField
                control={form.control}
                name='name'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tên shop</FormLabel>
                    <FormControl>
                      <Input placeholder='Nhập tên shop' {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name='description'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Mô tả</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder='Nhập mô tả về shop'
                        className='min-h-[100px]'
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name='addressId'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Địa chỉ</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value}
                      disabled={isLoadingAddresses}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder='Chọn địa chỉ' />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {addresses.map((address) => (
                          <SelectItem key={address.id} value={address.id}>
                            {address.detail}, {address.ward}, {address.province}
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
                name='bankName'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Ngân hàng</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder='Chọn ngân hàng' />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {Object.entries(BANK_NAMES).map(([code, name]) => (
                          <SelectItem key={code} value={code}>
                            {name}
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
                name='bankNumber'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Số tài khoản</FormLabel>
                    <FormControl>
                      <Input placeholder='Nhập số tài khoản' {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name='taxCode'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Mã số thuế</FormLabel>
                    <FormControl>
                      <Input placeholder='Nhập mã số thuế' {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button
                type='submit'
                disabled={isUpdatingInfo}
                className='bg-[#004643] hover:bg-[#003832]'
              >
                {isUpdatingInfo ? (
                  <>
                    <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                    Đang cập nhật...
                  </>
                ) : (
                  'Cập nhật thông tin'
                )}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {/* Sale Campaign Toggle */}
      <Card>
        <CardHeader>
          <CardTitle className='text-[#004643]'>Chương trình khuyến mãi</CardTitle>
          <CardDescription>
            Tham gia các chương trình khuyến mãi để tăng doanh số
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className='flex items-center justify-between'>
            <div className='space-y-0.5'>
              <div className='text-sm font-medium'>
                Tham gia chương trình khuyến mãi
              </div>
              <div className='text-sm text-gray-500'>
                Cho phép shop tham gia các chương trình sale và ưu đãi
              </div>
            </div>
            <Switch
              checked={shop.isJoinSaleCampaign || false}
              onCheckedChange={handleSaleCampaignToggle}
              disabled={isUpdatingSaleCampaign}
              className='data-[state=checked]:bg-[#004643]'
            />
          </div>
        </CardContent>
      </Card>

      {/* Đóng shop */}
      <Card className='border-red-200'>
        <CardHeader>
          <CardTitle className='text-red-600'>Đóng shop</CardTitle>
          <CardDescription>
            Đóng shop sẽ ngừng hoạt động kinh doanh và không thể mở lại
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className='flex items-center justify-between'>
            <div className='space-y-0.5'>
              <div className='text-sm font-medium'>
                Xác nhận đóng shop
              </div>
              <div className='text-sm text-gray-500'>
                {shop.status === 'CLOSED' 
                  ? 'Shop đã được đóng và không thể mở lại'
                  : 'Bật công tắc này để đóng shop vĩnh viễn'
                }
              </div>
            </div>
            <Switch
              checked={shop.status === 'CLOSED'}
              onCheckedChange={handleCloseShop}
              disabled={isClosingShop || shop.status === 'CLOSED'}
              className='data-[state=checked]:bg-red-500'
            />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}