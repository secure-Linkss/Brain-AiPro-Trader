import { useEffect, useRef } from "react"

export interface PriceUpdate {
  symbol: string
  price: number
  change: number
  volume: number
  timestamp: string
}

export interface SignalUpdate {
  id: string
  symbol: string
  type: "BUY" | "SELL" | "HOLD"
  strength: number
  strategy: string
  entryPrice?: number
  stopLoss?: number
  takeProfit?: number
  reason: string
  userId: string
}

class SocketService {
  private socket: any = null
  private callbacks: Map<string, ((data: any) => void)[]> = new Map()

  connect() {
    if (typeof window === "undefined") return

    this.socket = (window as any).io({
      path: "/api/socket/io",
      addTrailingSlash: false
    })

    this.socket.on("connect", () => {
      console.log("Connected to socket server")
    })

    this.socket.on("disconnect", () => {
      console.log("Disconnected from socket server")
    })

    this.socket.on("price-update", (data: PriceUpdate) => {
      this.emit("price-update", data)
    })

    this.socket.on("signal-update", (data: SignalUpdate) => {
      this.emit("signal-update", data)
    })

    this.socket.on("analysis-complete", (data: any) => {
      this.emit("analysis-complete", data)
    })
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect()
      this.socket = null
    }
  }

  joinUserRoom(userId: string) {
    if (this.socket) {
      this.socket.emit("join-user-room", userId)
    }
  }

  subscribeSymbol(symbol: string, userId: string) {
    if (this.socket) {
      this.socket.emit("subscribe-symbol", { symbol, userId })
    }
  }

  unsubscribeSymbol(symbol: string, userId: string) {
    if (this.socket) {
      this.socket.emit("unsubscribe-symbol", { symbol, userId })
    }
  }

  on(event: string, callback: (data: any) => void) {
    if (!this.callbacks.has(event)) {
      this.callbacks.set(event, [])
    }
    this.callbacks.get(event)!.push(callback)
  }

  off(event: string, callback: (data: any) => void) {
    const callbacks = this.callbacks.get(event)
    if (callbacks) {
      const index = callbacks.indexOf(callback)
      if (index > -1) {
        callbacks.splice(index, 1)
      }
    }
  }

  private emit(event: string, data: any) {
    const callbacks = this.callbacks.get(event)
    if (callbacks) {
      callbacks.forEach(callback => callback(data))
    }
  }

  isConnected(): boolean {
    return this.socket && this.socket.connected
  }
}

export const socketService = new SocketService()

export function useSocket() {
  const socketRef = useRef(socketService)

  useEffect(() => {
    socketRef.current.connect()
    return () => {
      socketRef.current.disconnect()
    }
  }, [])

  return socketRef.current
}