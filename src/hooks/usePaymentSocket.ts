'use client'

import { useRef, useState } from 'react'
import { io, type Socket } from 'socket.io-client'
import env from '~/config/env.config'

interface PaymentCallbacks {
  onSuccess?: (data: { orderIds: string[]; message: string }) => void
  onFailed?: (data: { message: string }) => void
  onTimeout?: (data: { message: string }) => void
  onQRCode?: (data: { qrUrl: string; amount: number; sagaId: string }) => void
}

/**
 * Hook quản lý kết nối WebSocket tới saga-orchestrator /payment namespace.
 * Kết nối trực tiếp tới saga-orchestrator (không qua Kong API Gateway).
 */
export function usePaymentSocket() {
  const socketRef = useRef<Socket | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const callbacksRef = useRef<PaymentCallbacks>({})

  const connect = (callbacks: PaymentCallbacks) => {
    callbacksRef.current = callbacks

    if (socketRef.current?.connected) return

    const accessToken = localStorage.getItem('accessToken')
    if (!accessToken) return

    const socket = io(`${env.NEXT_PUBLIC_SAGA_WS_URL}/payment`, {
      auth: { token: accessToken },
      transports: ['websocket'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 2000,
    })

    socket.on('connect', () => setIsConnected(true))
    socket.on('disconnect', () => setIsConnected(false))

    socket.on('payment:success', (data: { orderIds: string[]; message: string }) => {
      callbacksRef.current.onSuccess?.(data)
    })

    socket.on('payment:failed', (data: { message: string }) => {
      callbacksRef.current.onFailed?.(data)
    })

    socket.on('payment:timeout', (data: { message: string }) => {
      callbacksRef.current.onTimeout?.(data)
    })

    socket.on('payment:qrcode', (data: { qrUrl: string; amount: number; sagaId: string }) => {
      callbacksRef.current.onQRCode?.(data)
    })

    socketRef.current = socket
  }

  const disconnect = () => {
    if (socketRef.current) {
      socketRef.current.removeAllListeners()
      socketRef.current.disconnect()
      socketRef.current = null
      setIsConnected(false)
    }
  }

  return { connect, disconnect, isConnected }
}
