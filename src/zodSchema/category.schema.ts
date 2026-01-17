import { z } from 'zod'

// Schema cho thuộc tính của category (dạng object)
export const CategoryAttributeObjectSchema = z.object({
  name: z.string(),
  required: z.boolean().optional().default(false),
})
export type CategoryAttributeObject = z.infer<typeof CategoryAttributeObjectSchema>

// Attributes có thể là array of strings hoặc array of objects
export const CategoryAttributesSchema = z.union([
  z.array(z.string()),
  z.array(CategoryAttributeObjectSchema),
]).nullable()

// Schema cho Category từ API
export const CategorySchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  parentId: z.string().nullable(),
  attributes: CategoryAttributesSchema,
  createdAt: z.string(),
  updatedAt: z.string(),
})
export type Category = z.infer<typeof CategorySchema>

// Schema cho Category với children (dạng nested từ API)
export const CategoryWithChildrenSchema: z.ZodType<CategoryWithChildren> = CategorySchema.extend({
  children: z.lazy(() => z.array(CategoryWithChildrenSchema)).optional(),
})
export type CategoryWithChildren = z.infer<typeof CategorySchema> & {
  children?: CategoryWithChildren[]
}

// Helper type cho attribute (dạng chuẩn hóa)
export type NormalizedAttribute = {
  name: string
  required: boolean
}

// Helper function để chuẩn hóa attributes từ cả 2 format
export function normalizeAttributes(
  attributes: string[] | CategoryAttributeObject[] | null | undefined
): NormalizedAttribute[] {
  if (!attributes || attributes.length === 0) return []
  
  return attributes.map((attr) => {
    if (typeof attr === 'string') {
      return { name: attr, required: false }
    }
    return { name: attr.name, required: attr.required ?? false }
  })
}