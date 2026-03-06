export const SENDER_TYPE = {
  USER: 'USER',
  SHOP: 'SHOP',
} as const

export type SenderType = (typeof SENDER_TYPE)[keyof typeof SENDER_TYPE]

export const MESSAGE_TYPE = {
  TEXT: 'TEXT',
  IMAGE: 'IMAGE',
} as const

export type MessageType = (typeof MESSAGE_TYPE)[keyof typeof MESSAGE_TYPE]
