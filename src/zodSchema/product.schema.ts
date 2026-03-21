import { z } from 'zod'

// Response tá»« API upload áº£nh/video
export const UploadMediaResponseSchema = z.object({
  url: z.url(),
})
export type UploadMediaResponse = z.infer<typeof UploadMediaResponseSchema>


export const ProductVariantInputSchema = z.object({
  id: z.string().optional(), // Optional - cÃ³ khi update, khÃ´ng cÃ³ khi táº¡o má»›i
  sku: z.string().min(1, 'SKU khÃ´ng Ä‘Æ°á»£c Ä‘á»ƒ trá»‘ng'),
  price: z.number().min(0, 'GiÃ¡ pháº£i lá»›n hÆ¡n hoáº·c báº±ng 0'),
  stock: z.number().min(0, 'Sá»‘ lÆ°á»£ng pháº£i lá»›n hÆ¡n hoáº·c báº±ng 0'),
  image: z.url().optional().nullable(),
  optionValues: z.array(z.string()).optional(), // Máº£ng cÃ¡c giÃ¡ trá»‹ option theo thá»© tá»± classifications
})
export type ProductVariantInput = z.infer<typeof ProductVariantInputSchema>


export const ClassificationOptionSchema = z.object({
  id: z.string(), // ID táº¡m thá»i cho frontend (khÃ´ng gá»­i lÃªn BE)
  value: z.string().min(1, 'GiÃ¡ trá»‹ khÃ´ng Ä‘Æ°á»£c Ä‘á»ƒ trá»‘ng'),
})
export type ClassificationOption = z.infer<typeof ClassificationOptionSchema>

export const ClassificationSchema = z.object({
  id: z.string(), // ID táº¡m thá»i cho frontend
  name: z.string().min(1, 'TÃªn phÃ¢n loáº¡i khÃ´ng Ä‘Æ°á»£c Ä‘á»ƒ trá»‘ng'),
  options: z.array(ClassificationOptionSchema).min(1, 'Cáº§n Ã­t nháº¥t 1 tÃ¹y chá»n'),
})
export type Classification = z.infer<typeof ClassificationSchema>



export const CreateProductSchema = z.object({
  name: z.string().min(1, 'TÃªn sáº£n pháº©m khÃ´ng Ä‘Æ°á»£c Ä‘á»ƒ trá»‘ng'),
  descriptions: z.string().min(1, 'MÃ´ táº£ sáº£n pháº©m khÃ´ng Ä‘Æ°á»£c Ä‘á»ƒ trá»‘ng'),
  categoryId: z.string(),
  mainImage: z.string(),
  galleryImage: z.array(z.string()).max(5, 'Tá»‘i Ä‘a 5 áº£nh phá»¥').optional().nullable(),
  video: z.string().optional().nullable(),
  unit: z.string().min(1, 'ÄÆ¡n vá»‹ khÃ´ng Ä‘Æ°á»£c Ä‘á»ƒ trá»‘ng'),
  attributes: z.record(z.string(), z.string()),
  variants: z.array(ProductVariantInputSchema).min(1, 'Cáº§n Ã­t nháº¥t 1 SKU'),
})
export type CreateProductInput = z.infer<typeof CreateProductSchema>

// Schema cho classification gá»­i lÃªn API (dÃ¹ng cho táº¡o sáº£n pháº©m)
export const ClassificationInputSchema = z.object({
  name: z.string().min(1, 'TÃªn phÃ¢n loáº¡i khÃ´ng Ä‘Æ°á»£c Ä‘á»ƒ trá»‘ng'),
  values: z.array(z.string().min(1)).min(1, 'Cáº§n Ã­t nháº¥t 1 giÃ¡ trá»‹'),
})
export type ClassificationInput = z.infer<typeof ClassificationInputSchema>

// Schema cho dá»¯ liá»‡u gá»­i lÃªn API
export const CreateProductBodySchema = CreateProductSchema.extend({
  shopId: z.uuid(),
  classifications: z.array(ClassificationInputSchema).optional(), // PhÃ¢n loáº¡i hÃ ng
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

// ========== Schemas cho trang Quáº£n lÃ½ sáº£n pháº©m ==========

// Variant vá»›i trÆ°á»ng stock vÃ  soldQuantity (láº¥y tá»« inventory service)
export const ProductVariantWithStockSchema = ProductVariantSchema.extend({
  stock: z.number().optional().default(0),
  soldQuantity: z.number().optional().default(0),
})
export type ProductVariantWithStock = z.infer<typeof ProductVariantWithStockSchema>

// Product vá»›i variants Ä‘áº§y Ä‘á»§ (bao gá»“m stock)
export const ProductWithVariantsSchema = ProductSchema.extend({
  variants: z.array(ProductVariantWithStockSchema),
})
export type ProductWithVariants = z.infer<typeof ProductWithVariantsSchema>

// Schema cho response API getProductById (bao gá»“m category name vÃ  stock/soldQuantity)
export const ProductDetailSchema = ProductSchema.extend({
  variants: z.array(ProductVariantWithStockSchema),
  category: z.object({
    name: z.string(),
  }).optional(),
  classifications: z.array(ClassificationInputSchema).optional(), // ThÃªm classifications
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

// Response tá»« API products paginated
export const ProductsPaginatedResponseSchema = z.object({
  items: z.array(ProductWithVariantsSchema),
  meta: PaginationMetaSchema,
})
export type ProductsPaginatedResponse = z.infer<typeof ProductsPaginatedResponseSchema>

// Schema cho form cáº­p nháº­t sáº£n pháº©m
export const UpdateProductSchema = z.object({
  name: z.string().min(1, 'TÃªn sáº£n pháº©m khÃ´ng Ä‘Æ°á»£c Ä‘á»ƒ trá»‘ng'),
  descriptions: z.string().min(1, 'MÃ´ táº£ sáº£n pháº©m khÃ´ng Ä‘Æ°á»£c Ä‘á»ƒ trá»‘ng'),
  mainImage: z.string().min(1, 'áº¢nh chÃ­nh khÃ´ng Ä‘Æ°á»£c Ä‘á»ƒ trá»‘ng'),
  galleryImage: z.array(z.string()).max(5, 'Tá»‘i Ä‘a 5 áº£nh phá»¥').optional().nullable(),
  video: z.string().optional().nullable(),
  unit: z.string().min(1, 'ÄÆ¡n vá»‹ khÃ´ng Ä‘Æ°á»£c Ä‘á»ƒ trá»‘ng'),
  attributes: z.record(z.string(), z.string()),
  classifications: z.array(ClassificationInputSchema).optional(), // ThÃªm classifications
  variants: z.array(
    z.object({
      id: z.uuid().optional(), // Optional - variant má»›i khÃ´ng cÃ³ id
      sku: z.string().min(1, 'SKU khÃ´ng Ä‘Æ°á»£c Ä‘á»ƒ trá»‘ng'),
      price: z.number().min(0, 'GiÃ¡ pháº£i lá»›n hÆ¡n hoáº·c báº±ng 0'),
      stock: z.number().min(0, 'Sá»‘ lÆ°á»£ng pháº£i lá»›n hÆ¡n hoáº·c báº±ng 0'),
      image: z.string().optional().nullable(),
      optionValues: z.array(z.string()).optional(), // ThÃªm optionValues
    })
  ),
})
export type UpdateProductInput = z.infer<typeof UpdateProductSchema>

// Schema cho body gá»­i lÃªn API update
export const UpdateProductBodySchema = UpdateProductSchema.extend({
  productId: z.uuid(),
})
export type UpdateProductBody = z.infer<typeof UpdateProductBodySchema>

// ========== Schemas cho trang Admin duyá»‡t sáº£n pháº©m ==========

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

// ========== Schemas cho trang Chi tiáº¿t sáº£n pháº©m (Public) ==========

// Variant cho API getProductToSold
export const ProductVariantToSoldSchema = z.object({
  id: z.uuid(),
  sku: z.string(),
  price: z.number(),
  image: z.string().nullable(),
  stock: z.number(),
})
export type ProductVariantToSold = z.infer<typeof ProductVariantToSoldSchema>

// Schema cho API getProductToSold
export const ProductToSoldSchema = z.object({
  id: z.uuid(),
  name: z.string(),
  description: z.string(),
  attributes: z.record(z.string(), z.string()),
  mainImage: z.string(),
  galleryImage: z.array(z.string()),
  video: z.string().nullable(),
  ratingAvg: z.number(),
  ratingCount: z.number(),
  unit: z.string(),
  soldQuantity: z.number(),
  availableQuantity: z.number(),
  variants: z.array(ProductVariantToSoldSchema),
  shop: z.object({
    id: z.uuid(),
    name: z.string(),
    logo: z.string().nullable(),
    productCount: z.number(),
    createdAt: z.string(),
  }),
})
export type ProductToSold = z.infer<typeof ProductToSoldSchema>

// Schema cho Review
export const ProductReviewSchema = z.object({
  id: z.uuid(),
  productId: z.uuid(),
  shopId: z.uuid(),
  orderId: z.uuid(),
  sku: z.string(),
  rating: z.number(),
  content: z.string(),
  images: z.array(z.string()),
  video: z.string().nullable(),
  isHidden: z.boolean(),
  hiddenReason: z.string().nullable(),
  hiddenAt: z.string().nullable(),
  createdAt: z.string(),
  buyerUsername: z.string(),
  buyerAvatar: z.string().nullable(),
  productName: z.string(),
  productImage: z.string(),
  user: z.object({
    id: z.uuid(),
    username: z.string(),
    avatar: z.string().nullable(),
  }),
  reply: z.object({
    content: z.string(),
    createdAt: z.string(),
  }).nullable(),
})
export type ProductReview = z.infer<typeof ProductReviewSchema>

// Schema cho response API getProductReviews vá»›i pagination
export const ProductReviewsPaginatedResponseSchema = z.object({
  items: z.array(ProductReviewSchema),
  meta: PaginationMetaSchema,
})
export type ProductReviewsPaginatedResponse = z.infer<typeof ProductReviewsPaginatedResponseSchema>


// Schema cho đánh giá của shop
export const ShopReviewSchema = z.object({
  id: z.uuid(),
  productId: z.uuid(),
  shopId: z.uuid(),
  orderId: z.uuid(),
  buyerUsername: z.string(),
  buyerAvatar: z.string().nullable(),
  productName: z.string(),
  productImage: z.string(),
  sku: z.string(),
  rating: z.number(),
  content: z.string().nullable(),
  images: z.array(z.string()),
  video: z.string().nullable(),
  isHidden: z.boolean(),
  hiddenReason: z.string().nullable(),
  hiddenAt: z.string().nullable(),
  createdAt: z.string(),
  reply: z.object({
    content: z.string(),
    createdAt: z.string(),
  }).nullable(),
})
export type ShopReview = z.infer<typeof ShopReviewSchema>

export const ShopReviewsPaginatedResponseSchema = z.object({
  items: z.array(ShopReviewSchema),
  meta: PaginationMetaSchema,
})
export type ShopReviewsPaginatedResponse = z.infer<typeof ShopReviewsPaginatedResponseSchema>

export const ReportedReviewSchema = z.object({
  id: z.uuid(),
  buyerUsername: z.string(),
  buyerAvatar: z.string().nullable(),
  productName: z.string(),
  productImage: z.string(),
  sku: z.string(),
  rating: z.number(),
  images: z.array(z.string()),
  video: z.string().nullable(),
  createdAt: z.string(),
  report: z.object({
    reporterUsername: z.string(),
    reporterAvatar: z.string().nullable(),
    reason: z.string(),
    description: z.string().nullable(),
    createdAt: z.string(),
  }),
})
export type ReportedReview = z.infer<typeof ReportedReviewSchema>

export const ReportedReviewsPaginatedResponseSchema = z.object({
  items: z.array(ReportedReviewSchema),
  meta: PaginationMetaSchema,
})
export type ReportedReviewsPaginatedResponse = z.infer<typeof ReportedReviewsPaginatedResponseSchema>

