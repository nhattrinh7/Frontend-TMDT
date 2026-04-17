import * as z from 'zod'

export const szoneVoucherSchema = z
  .object({
    code: z
      .string()
      .min(3, 'Mã voucher phải có ít nhất 3 ký tự')
      .max(20, 'Mã voucher không được quá 20 ký tự')
      .regex(/^[A-Z0-9]+$/, 'Mã voucher chỉ được chứa chữ in hoa và số'),
    name: z
      .string()
      .min(5, 'Tên voucher phải có ít nhất 5 ký tự')
      .max(100, 'Tên voucher không được quá 100 ký tự'),
    description: z
      .string()
      .min(10, 'Mô tả phải có ít nhất 10 ký tự')
      .max(500, 'Mô tả không được quá 500 ký tự'),
    discountType: z.enum(['FIXED', 'PERCENT']),
    discountValue: z.number().positive('Giá trị giảm phải lớn hơn 0'),
    minOrderValue: z
      .number()
      .nonnegative('Giá trị đơn hàng tối thiểu phải >= 0'),
    maxDiscountValue: z
      .number()
      .nonnegative('Mức giảm tối đa phải >= 0')
      .optional(),
    startDate: z.date(),
    endDate: z.date(),
    usageLimit: z
      .number()
      .int('Số lượt sử dụng phải là số nguyên')
      .positive('Số lượt sử dụng phải lớn hơn 0')
      .min(1, 'Số lượt sử dụng tối thiểu là 1'),
    perUserLimit: z
      .number()
      .int('Giới hạn mỗi người phải là số nguyên')
      .positive('Giới hạn mỗi người phải lớn hơn 0')
      .min(1, 'Giới hạn mỗi người tối thiểu là 1'),
    scope: z.enum(['ALL', 'CATEGORY']),
    selectedCategories: z.array(z.string()).optional(),
  })
  .refine((data) => data.endDate > data.startDate, {
    message: 'Ngày kết thúc phải sau ngày bắt đầu',
    path: ['endDate'],
  })
  .refine(
    (data) => {
      if (data.discountType === 'PERCENT') {
        return data.discountValue <= 100
      }
      return true
    },
    {
      message: 'Phần trăm giảm giá không được vượt quá 100%',
      path: ['discountValue'],
    },
  )
  .refine(
    (data) => {
      if (data.scope === 'CATEGORY') {
        return data.selectedCategories && data.selectedCategories.length > 0
      }
      return true
    },
    {
      message: 'Vui lòng chọn ít nhất một ngành hàng',
      path: ['selectedCategories'],
    },
  )

export type SzoneVoucherFormValues = z.infer<typeof szoneVoucherSchema>
