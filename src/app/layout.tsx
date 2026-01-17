import type { Metadata } from 'next'
import { Roboto } from 'next/font/google'
import './globals.css'
import { ThemeProvider } from '~/components/theme-provider'
import { Toaster } from 'sonner'

const RobotoSans = Roboto({
  variable: '--font-roboto-sans',
  subsets: ['vietnamese'],
})

export const metadata: Metadata = {
  title: 'Szone',
  description: 'Thương mại điện tử của mọi nhà',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang='en' suppressHydrationWarning >
      <body
        className={`${RobotoSans.variable} antialiased`}
      >
        <ThemeProvider 
          attribute='class' 
          defaultTheme='system' 
          enableSystem
          disableTransitionOnChange 
        >
          {children}
          <Toaster position="top-right" richColors />
        </ThemeProvider>
      </body>
    </html>
  )
}
