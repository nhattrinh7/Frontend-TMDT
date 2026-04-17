# === BƯỚC 1: Cài đặt dependencies ===
FROM node:22-alpine AS deps
# Alpine image cần libc6-compat cho một số thư viện native (turbopack, swc)
RUN apk add --no-cache libc6-compat
WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm ci

# === BƯỚC 2: Build project ===
FROM node:22-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# QUAN TRỌNG: Copy file .env.production để Next.js bake các biến NEXT_PUBLIC_* vào JS bundle lúc build
# (env_file trong docker-compose KHÔNG có tác dụng với NEXT_PUBLIC_ vì chúng cần ở build-time)
COPY .env.production .env.production

ENV NEXT_TELEMETRY_DISABLED=1

RUN npm run build

# === BƯỚC 3: Runner (Môi trường Production) ===
FROM node:22-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Tạo non-root user để tăng bảo mật
# (Cần tạo user TRONG image để đảm bảo user tồn tại trong filesystem, tránh lỗi os.userInfo())
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy thư mục public (chứa favicon, ảnh tĩnh, v.v.)
COPY --from=builder /app/public ./public

# Tạo thư mục .next và cấp quyền cho nextjs user
RUN mkdir .next
RUN chown nextjs:nodejs .next

# Copy standalone output (được tạo ra nhờ `output: 'standalone'` trong next.config.ts)
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
# Copy các assets tĩnh (CSS, JS chunks, images đã optimize)
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["node", "server.js"]
