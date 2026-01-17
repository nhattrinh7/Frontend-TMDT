'use client'

import { useState, useEffect } from 'react'
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
import { Loader2 } from 'lucide-react'
import { BankEnum, CategoryEnum } from '~/zodSchema/shop.schema'
import { Address } from '~/app/(private)/profile/AddressManagement'
import { getDefaultAddressAPI } from '~/apiRequests/user.apiRequest'
import { useBoundStore } from '~/zustand/store'
import { toast } from 'sonner'
import { createShopAPI } from '~/apiRequests/shop.apiRequest'
import { useRouter } from 'next/navigation'

const formSchema = z.object({
  name: z.string().min(1, 'Tên shop là bắt buộc').max(50, 'Tên shop tối đa 50 ký tự'),
  description: z.string().min(1, 'Mô tả là bắt buộc').max(200, 'Mô tả tối đa 200 ký tự'),
  category: CategoryEnum,
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

const CATEGORY_LABELS: Record<z.infer<typeof CategoryEnum>, string> = {
  FASHION: 'Thời trang',
  FASHION_ACCESSORIES: 'Phụ kiện thời trang',
  BAGS_WALLETS: 'Túi xách & Ví',
  WATCHES: 'Đồng hồ',
  FOOTWEAR: 'Giày dép',
  BEAUTY: 'Làm đẹp',
  HEALTH: 'Sức khỏe',
  MOTHER_BABY: 'Mẹ và bé',
  PHONES: 'Điện thoại',
  AUDIO_DEVICES: 'Thiết bị âm thanh',
  CAMERAS_FLYCAM: 'Camera & Flycam',
  HOME_APPLIANCES: 'Điện gia dụng',
  HOME_LIVING: 'Nhà cửa & Đời sống',
  STATIONERY: 'Văn phòng phẩm',
  SPORTS_OUTDOOR: 'Thể thao & Dã ngoại',
  FOOD_BEVERAGE: 'Thực phẩm & Đồ uống',
}

export default function CreateShopForm() {
  const [defaultAddress, setDefaultAddress] = useState<Address>()
  const [isLoadingAddress, setIsLoadingAddress] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const router = useRouter()
  const user = useBoundStore((state) => state.user)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      description: '',
      category: undefined,
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

    const fetchDefaultAddress = async () => {
      try {
        const response = await getDefaultAddressAPI(user.id)
        setDefaultAddress(response.data)
      } catch {
        toast.error('Không tải được địa chỉ, vui lòng thử lại sau')
      } finally {
        setIsLoadingAddress(false)
      }
    }

    fetchDefaultAddress()
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

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsSubmitting(true)
    try {
      const dataToCreate = { ...values, addressId: defaultAddress?.id }
      await createShopAPI(dataToCreate)
      toast.success('Đăng kí thành công, kết quả phê duyệt sẽ được gửi vào email của bạn')
      router.push('/shop/orders')
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
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Ngành hàng</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Chọn ngành hàng" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {CategoryEnum.options.map((category) => (
                          <SelectItem key={category} value={category}>
                            {CATEGORY_LABELS[category]}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="space-y-2">
                <FormLabel>Địa chỉ shop</FormLabel>
                <div className="p-4 bg-gray-50 rounded-md border">
                  {isLoadingAddress ? (
                    <div className="flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span className="text-sm text-gray-600">Đang tải địa chỉ...</span>
                    </div>
                  ) : defaultAddress ? (
                    <div className="space-y-1">
                      <p className="text-gray-600 text-sm font-medium">{defaultAddress.recipientName} - {defaultAddress.recipientPhoneNumber}</p>
                      <p className="text-sm text-gray-600">
                        {defaultAddress.detail}, {defaultAddress.ward}, {defaultAddress.province}
                      </p>
                    </div>
                  ) : (
                    <p className="text-sm text-gray-600">
                      Chưa có địa chỉ mặc định.{' '}
                      <a href="/profile/address" className="text-blue-600 hover:underline">
                        Thêm địa chỉ
                      </a>
                    </p>
                  )}
                </div>
                <FormDescription>
                  Sử dụng địa chỉ mặc định (có thể thay đổi sau)
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
            disabled={isSubmitting}
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
    </div>
  )
}