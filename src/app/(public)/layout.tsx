import Header from '~/app/(public)/Header'
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
      <ChatWidget />
    </div>
  )
}
