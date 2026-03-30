import type { Metadata } from 'next'
import { Roboto } from 'next/font/google'
import './globals.css'
import { GoogleOAuthProvider } from '@react-oauth/google'
import { ThemeProvider } from '~/components/ThemeProvider'
import { Toaster } from 'sonner'

const RobotoSans = Roboto({
  variable: '--font-roboto-sans',
  subsets: ['vietnamese'],
})

export const metadata: Metadata = {
  title: 'Szone',
  description: 'Thương mại điện tử của mọi nhà',
}

const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ?? ''

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
        <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
          <ThemeProvider 
            attribute='class' 
            defaultTheme='system' 
            enableSystem
            disableTransitionOnChange 
          >
            {children}
            <Toaster position='top-right' richColors />
          </ThemeProvider>
        </GoogleOAuthProvider>
      </body>
    </html>
  )
}

