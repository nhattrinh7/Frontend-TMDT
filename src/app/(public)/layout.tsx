import Header from '~/app/(public)/Header'
import { ChatWidget } from '~/app/components/chat-widget/ChatWidget'

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
