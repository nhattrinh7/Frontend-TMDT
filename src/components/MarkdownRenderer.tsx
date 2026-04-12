import type { ReactNode } from 'react'

type MarkdownRendererProps = {
  markdown: string
}

type ParagraphLine = {
  text: string
  hardBreak: boolean
}

function renderInline(text: string): ReactNode[] {
  const nodes: ReactNode[] = []
  let cursor = 0

  const pushText = (value: string) => {
    if (!value) return
    nodes.push(value)
  }

  // Minimal inline support: `code` and [label](url)
  while (cursor < text.length) {
    const nextCode = text.indexOf('`', cursor)
    const nextLink = text.indexOf('[', cursor)

    let next = -1
    let kind: 'code' | 'link' | null = null

    if (nextCode !== -1) {
      next = nextCode
      kind = 'code'
    }
    if (nextLink !== -1 && (next === -1 || nextLink < next)) {
      next = nextLink
      kind = 'link'
    }

    if (next === -1 || kind === null) {
      pushText(text.slice(cursor))
      break
    }

    pushText(text.slice(cursor, next))

    if (kind === 'code') {
      const end = text.indexOf('`', next + 1)
      if (end === -1) {
        pushText(text.slice(next))
        break
      }
      const code = text.slice(next + 1, end)
      nodes.push(
        <code
          key={`code-${next}-${end}`}
          className='rounded bg-gray-100 px-1 py-0.5 font-mono text-[0.95em] text-gray-800'
        >
          {code}
        </code>
      )
      cursor = end + 1
      continue
    }

    // link: [label](url)
    const closeBracket = text.indexOf(']', next + 1)
    const openParen = closeBracket !== -1 ? text.indexOf('(', closeBracket + 1) : -1
    const closeParen = openParen !== -1 ? text.indexOf(')', openParen + 1) : -1

    if (closeBracket === -1 || openParen !== closeBracket + 1 || closeParen === -1) {
      pushText(text.slice(next, next + 1))
      cursor = next + 1
      continue
    }

    const label = text.slice(next + 1, closeBracket)
    const url = text.slice(openParen + 1, closeParen)

    const isSafeUrl =
      url.startsWith('https://') ||
      url.startsWith('http://') ||
      url.startsWith('mailto:') ||
      url.startsWith('tel:')

    if (isSafeUrl) {
      nodes.push(
        <a
          key={`link-${next}-${closeParen}`}
          href={url}
          className='text-[#004643] underline decoration-[#004643]/40 underline-offset-4 hover:decoration-[#004643]'
          target={url.startsWith('http') ? '_blank' : undefined}
          rel={url.startsWith('http') ? 'noopener noreferrer' : undefined}
        >
          {label}
        </a>
      )
    } else {
      pushText(`${label} (${url})`)
    }

    cursor = closeParen + 1
  }

  return nodes
}

function renderParagraph(lines: ParagraphLine[], key: string) {
  return (
    <p key={key} className='text-gray-700 leading-7'>
      {lines.map((line, index) => (
        <span key={`${key}-l-${index}`}>
          {renderInline(line.text)}
          {line.hardBreak ? <br /> : index < lines.length - 1 ? ' ' : null}
        </span>
      ))}
    </p>
  )
}

function renderHeading(level: 1 | 2 | 3, text: string, key: string) {
  if (level === 1) {
    return (
      <h1 key={key} className='text-2xl md:text-3xl font-extrabold tracking-tight text-gray-900'>
        {text}
      </h1>
    )
  }
  if (level === 2) {
    return (
      <h2 key={key} className='pt-4 text-xl md:text-2xl font-bold tracking-tight text-gray-900'>
        {text}
      </h2>
    )
  }
  return (
    <h3 key={key} className='pt-3 text-lg font-bold tracking-tight text-gray-900'>
      {text}
    </h3>
  )
}

export default function MarkdownRenderer({ markdown }: MarkdownRendererProps) {
  const input = markdown.replace(/^\uFEFF/, '')
  const lines = input.split(/\r?\n/)

  const nodes: ReactNode[] = []
  let paragraph: ParagraphLine[] = []
  let ul: string[] = []
  let ol: string[] = []
  let inCodeFence = false
  let codeFenceLang = ''
  let codeLines: string[] = []

  const flushParagraph = () => {
    if (!paragraph.length) return
    nodes.push(renderParagraph(paragraph, `p-${nodes.length}`))
    paragraph = []
  }

  const flushLists = () => {
    if (ul.length) {
      const items = ul
      nodes.push(
        <ul key={`ul-${nodes.length}`} className='list-disc pl-5 text-gray-700 leading-7 space-y-1'>
          {items.map((item, idx) => (
            <li key={idx}>{renderInline(item)}</li>
          ))}
        </ul>
      )
      ul = []
    }
    if (ol.length) {
      const items = ol
      nodes.push(
        <ol key={`ol-${nodes.length}`} className='list-decimal pl-5 text-gray-700 leading-7 space-y-1'>
          {items.map((item, idx) => (
            <li key={idx}>{renderInline(item)}</li>
          ))}
        </ol>
      )
      ol = []
    }
  }

  const flushCodeFence = () => {
    if (!codeLines.length) return
    const code = codeLines.join('\n')
    nodes.push(
      <pre
        key={`code-${nodes.length}`}
        className='overflow-x-auto rounded-xl bg-gray-950 px-4 py-3 text-gray-100'
      >
        <code className='text-sm leading-6'>
          {codeFenceLang ? `// ${codeFenceLang}\n` : ''}
          {code}
        </code>
      </pre>
    )
    codeLines = []
    codeFenceLang = ''
  }

  lines.forEach((rawLine, idx) => {
    const line = rawLine.replace(/\t/g, '  ')

    if (inCodeFence) {
      if (line.trim().startsWith('```')) {
        inCodeFence = false
        flushCodeFence()
      } else {
        codeLines.push(rawLine)
      }
      return
    }

    const trimmed = line.trim()

    if (trimmed.startsWith('```')) {
      flushParagraph()
      flushLists()
      inCodeFence = true
      codeFenceLang = trimmed.slice(3).trim()
      codeLines = []
      return
    }

    if (!trimmed) {
      flushParagraph()
      flushLists()
      return
    }

    if (trimmed === '---') {
      flushParagraph()
      flushLists()
      nodes.push(<hr key={`hr-${idx}`} className='my-6 border-gray-200' />)
      return
    }

    const headingMatch = /^(#{1,3})\s+(.+)$/.exec(trimmed)
    if (headingMatch) {
      flushParagraph()
      flushLists()
      const level = headingMatch[1].length as 1 | 2 | 3
      nodes.push(renderHeading(level, headingMatch[2], `h-${idx}`))
      return
    }

    const ulMatch = /^[-*]\s+(.+)$/.exec(trimmed)
    if (ulMatch) {
      flushParagraph()
      ol = []
      ul.push(ulMatch[1])
      return
    }

    const olMatch = /^(\d+)\.\s+(.+)$/.exec(trimmed)
    if (olMatch) {
      flushParagraph()
      ul = []
      ol.push(olMatch[2])
      return
    }

    flushLists()
    paragraph.push({ text: trimmed.replace(/\s+$/, ''), hardBreak: /\s\s$/.test(line) })
  })

  flushParagraph()
  flushLists()
  if (inCodeFence) flushCodeFence()

  return <div className='space-y-4'>{nodes}</div>
}
