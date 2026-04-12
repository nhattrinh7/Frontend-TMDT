import type { Metadata } from 'next'
import MarkdownRenderer from '~/components/MarkdownRenderer'
import { readLegalDocMarkdown } from '~/lib/legal-docs'

export const metadata: Metadata = {
  title: 'Điều khoản dịch vụ | Szone',
  description: 'Điều khoản dịch vụ của Szone.',
}

export default async function TermsOfServicePage() {
  const markdown = await readLegalDocMarkdown('terms-of-service')

  return (
    <main className='min-h-screen bg-gray-50'>
      <div className='mx-auto w-full max-w-400 px-4 lg:px-6 py-6 lg:py-10'>
        <div className='rounded-2xl bg-white p-6 lg:p-10 shadow-sm ring-1 ring-[#004643]/10'>
          <MarkdownRenderer markdown={markdown} />
        </div>
      </div>
    </main>
  )
}

