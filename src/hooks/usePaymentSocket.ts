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

  const connect = (callbacks: PaymentCallbacks): Promise<boolean> => {
    callbacksRef.current = callbacks

    if (socketRef.current?.connected) return Promise.resolve(true)

    const accessToken = localStorage.getItem('accessToken')
    if (!accessToken) return Promise.resolve(false)

    if (socketRef.current && !socketRef.current.connected) {
      socketRef.current.disconnect()
      socketRef.current = null
    }

    const socket = io(`${env.NEXT_PUBLIC_SAGA_WS_URL}/payment`, {
      auth: { token: accessToken },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 2000,
    })

    const connectionPromise = new Promise<boolean>((resolve) => {
      const timeout = setTimeout(() => {
        resolve(false)
      }, 8000)

      socket.once('connect', () => {
        clearTimeout(timeout)
        resolve(true)
      })

      socket.once('connect_error', () => {
        clearTimeout(timeout)
        resolve(false)
      })
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
    return connectionPromise
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
