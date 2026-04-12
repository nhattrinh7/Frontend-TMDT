import { readFile } from 'fs/promises'
import path from 'path'

type LegalDocId = 'privacy-policy' | 'terms-of-service'

const LEGAL_DOCS: Record<LegalDocId, { fileName: string }> = {
  'privacy-policy': { fileName: 'privacy-policy.md' },
  'terms-of-service': { fileName: 'terms-of-service.md' },
}

export async function readLegalDocMarkdown(docId: LegalDocId): Promise<string> {
  const fileName = LEGAL_DOCS[docId].fileName
  const filePath = path.join(process.cwd(), 'src', 'content', 'legal', fileName)
  const raw = await readFile(filePath, 'utf8')
  // Strip UTF-8 BOM if present.
  return raw.replace(/^\uFEFF/, '')
}

