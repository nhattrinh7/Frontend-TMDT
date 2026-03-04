import { z } from 'zod'

// NẾU DÙNG CẢ CÁC BIẾN MÔI TRƯỜNG KO CÓ TIỀN TỐ NEXT_PUBLIC_, TỨC LÀ CÁC BIẾN CHỈ DÙNG TRONG SERVER
// THÌ NỀN TẠO 1 FILE CONFIG NỮA DÀNH RIÊNG CHO CHÚNG
const configSchema = z.object({
  NEXT_PUBLIC_API_ENDPOINT: z.string(),
  NEXT_PUBLIC_URL: z.string(),
  NEXT_PUBLIC_SAGA_WS_URL: z.string(),
})

const configProject = configSchema.safeParse({
  NEXT_PUBLIC_API_ENDPOINT: process.env.NEXT_PUBLIC_API_ENDPOINT,
  NEXT_PUBLIC_URL: process.env.NEXT_PUBLIC_URL,
  NEXT_PUBLIC_SAGA_WS_URL: process.env.NEXT_PUBLIC_SAGA_WS_URL,
})

if (!configProject.success) {
  configProject.error.issues.forEach((issue) => {
    console.error(`\n***** - ${issue.path.join('.')}: ${issue.message} *****\n`)
  })
  throw new Error('Có khai báo biến môi trường thiếu hoặc không hợp lệ')
}

const env = configProject.data

export default env