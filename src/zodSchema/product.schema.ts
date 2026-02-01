import { z } from 'zod'

// Response từ API upload ảnh/video
export const UploadMediaResponseSchema = z.object({
  url: z.url(),
})
export type UploadMediaResponse = z.infer<typeof UploadMediaResponseSchema>


export const ProductVariantInputSchema = z.object({
  id: z.string().optional(), // Optional - có khi update, không có khi tạo mới
  sku: z.string().min(1, 'SKU không được để trống'),
  price: z.number().min(0, 'Giá phải lớn hơn hoặc bằng 0'),
  stock: z.number().min(0, 'Số lượng phải lớn hơn hoặc bằng 0'),
  image: z.url().optional().nullable(),
  optionValues: z.array(z.string()).optional(), // Mảng các giá trị option theo thứ tự classifications
})
export type ProductVariantInput = z.infer<typeof ProductVariantInputSchema>


export const ClassificationOptionSchema = z.object({
  id: z.string(), // ID tạm thời cho frontend (không gửi lên BE)
  value: z.string().min(1, 'Giá trị không được để trống'),
})
export type ClassificationOption = z.infer<typeof ClassificationOptionSchema>

export const ClassificationSchema = z.object({
  id: z.string(), // ID tạm thời cho frontend
  name: z.string().min(1, 'Tên phân loại không được để trống'),
  options: z.array(ClassificationOptionSchema).min(1, 'Cần ít nhất 1 tùy chọn'),
})
export type Classification = z.infer<typeof ClassificationSchema>



export const CreateProductSchema = z.object({
  name: z.string().min(1, 'Tên sản phẩm không được để trống'),
  descriptions: z.string().min(1, 'Mô tả sản phẩm không được để trống'),
  categoryId: z.string(),
  mainImage: z.string(),
  galleryImage: z.array(z.string()).max(5, 'Tối đa 5 ảnh phụ').optional().nullable(),
  video: z.string().optional().nullable(),
  unit: z.string().min(1, 'Đơn vị không được để trống'),
  attributes: z.record(z.string(), z.string()),
  variants: z.array(ProductVariantInputSchema).min(1, 'Cần ít nhất 1 SKU'),
})
export type CreateProductInput = z.infer<typeof CreateProductSchema>

// Schema cho classification gửi lên API (dùng cho tạo sản phẩm)
export const ClassificationInputSchema = z.object({
  name: z.string().min(1, 'Tên phân loại không được để trống'),
  values: z.array(z.string().min(1)).min(1, 'Cần ít nhất 1 giá trị'),
})
export type ClassificationInput = z.infer<typeof ClassificationInputSchema>

// Schema cho dữ liệu gửi lên API
export const CreateProductBodySchema = CreateProductSchema.extend({
  shopId: z.uuid(),
  classifications: z.array(ClassificationInputSchema).optional(), // Phân loại hàng
})
export type CreateProductBody = z.infer<typeof CreateProductBodySchema>



export const ApproveProductStatusEnum = z.enum(['PENDING', 'ACCEPTED', 'REJECTED'])

export const ProductVariantSchema = z.object({
  id: z.uuid(),
  productId: z.uuid(),
  sku: z.string(),
  price: z.number(),
  image: z.string().nullable().optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
})
export type ProductVariant = z.infer<typeof ProductVariantSchema>

export const ProductSchema = z.object({
  id: z.uuid(),
  name: z.string(),
  descriptions: z.string(),
  attributes: z.record(z.string(), z.string()),
  shopId: z.uuid(),
  categoryId: z.uuid(),
  mainImage: z.string(),
  galleryImage: z.array(z.string()),
  video: z.string().nullable().optional(),
  ratingAvg: z.number(),
  ratingCount: z.number(),
  unit: z.string(),
  isActive: z.boolean(),
  approveStatus: ApproveProductStatusEnum,
  rejectReason: z.string().nullable().optional(),
  isDeleted: z.boolean(),
  deletedAt: z.string().nullable().optional(),
  deletedBy: z.string().nullable().optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
  variants: z.array(ProductVariantSchema).optional(),
})
export type Product = z.infer<typeof ProductSchema>

// ========== Schemas cho trang Quản lý sản phẩm ==========

// Variant với trường stock và soldQuantity (lấy từ inventory service)
export const ProductVariantWithStockSchema = ProductVariantSchema.extend({
  stock: z.number().optional().default(0),
  soldQuantity: z.number().optional().default(0),
})
export type ProductVariantWithStock = z.infer<typeof ProductVariantWithStockSchema>

// Product với variants đầy đủ (bao gồm stock)
export const ProductWithVariantsSchema = ProductSchema.extend({
  variants: z.array(ProductVariantWithStockSchema),
})
export type ProductWithVariants = z.infer<typeof ProductWithVariantsSchema>

// Schema cho response API getProductById (bao gồm category name và stock/soldQuantity)
export const ProductDetailSchema = ProductSchema.extend({
  variants: z.array(ProductVariantWithStockSchema),
  category: z.object({
    name: z.string(),
  }).optional(),
  classifications: z.array(ClassificationInputSchema).optional(),  // Thêm classifications
})
export type ProductDetail = z.infer<typeof ProductDetailSchema>

// Pagination metadata
export const PaginationMetaSchema = z.object({
  total: z.number().int().min(0),
  page: z.number().int().positive(),
  limit: z.number().int().positive(),
  totalPages: z.number().int().min(0),
})
export type PaginationMeta = z.infer<typeof PaginationMetaSchema>

// Response từ API products paginated
export const ProductsPaginatedResponseSchema = z.object({
  items: z.array(ProductWithVariantsSchema),
  meta: PaginationMetaSchema,
})
export type ProductsPaginatedResponse = z.infer<typeof ProductsPaginatedResponseSchema>

// Schema cho form cập nhật sản phẩm
export const UpdateProductSchema = z.object({
  name: z.string().min(1, 'Tên sản phẩm không được để trống'),
  descriptions: z.string().min(1, 'Mô tả sản phẩm không được để trống'),
  mainImage: z.string().min(1, 'Ảnh chính không được để trống'),
  galleryImage: z.array(z.string()).max(5, 'Tối đa 5 ảnh phụ').optional().nullable(),
  video: z.string().optional().nullable(),
  unit: z.string().min(1, 'Đơn vị không được để trống'),
  attributes: z.record(z.string(), z.string()),
  classifications: z.array(ClassificationInputSchema).optional(),  // Thêm classifications
  variants: z.array(
    z.object({
      id: z.uuid().optional(),  // Optional - variant mới không có id
      sku: z.string().min(1, 'SKU không được để trống'),
      price: z.number().min(0, 'Giá phải lớn hơn hoặc bằng 0'),
      stock: z.number().min(0, 'Số lượng phải lớn hơn hoặc bằng 0'),
      image: z.string().optional().nullable(),
      optionValues: z.array(z.string()).optional(),  // Thêm optionValues
    })
  ),
})
export type UpdateProductInput = z.infer<typeof UpdateProductSchema>

// Schema cho body gửi lên API update
export const UpdateProductBodySchema = UpdateProductSchema.extend({
  productId: z.uuid(),
})
export type UpdateProductBody = z.infer<typeof UpdateProductBodySchema>

// ========== Schemas cho trang Admin duyệt sản phẩm ==========

export const AdminProductSchema = ProductSchema.extend({
  variants: z.array(ProductVariantSchema),
  shop: z.object({
    id: z.uuid(),
    name: z.string(),
    logo: z.string().nullable(),
  }),
  category: z.object({
    id: z.uuid(),
    name: z.string(),
  }),
})
export type AdminProduct = z.infer<typeof AdminProductSchema>

export const AdminProductsPaginatedResponseSchema = z.object({
  products: z.array(AdminProductSchema),
  meta: PaginationMetaSchema,
})
export type AdminProductsPaginatedResponse = z.infer<typeof AdminProductsPaginatedResponseSchema>

