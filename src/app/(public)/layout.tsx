import Header from '~/app/(public)/Header'
import Footer from '~/app/(public)/Footer'
import { ChatWidget } from '~/components/chat/ChatWidget'

export default function PublicLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <div>
      <Header />
      {children}
      <Footer />
      <ChatWidget />
    </div>
  )
}
