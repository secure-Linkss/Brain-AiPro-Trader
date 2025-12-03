import { Server as NetServer } from "http"
import { NextApiRequest, NextApiResponse } from "next"
import { Server as ServerIO } from "socket.io"

export const config = {
  api: {
    bodyParser: false,
  },
}

const SocketHandler = (req: NextApiRequest, res: NextApiResponse & { socket: any }) => {
  if (res.socket.server.io) {
    console.log("Socket is already running")
  } else {
    console.log("Socket is initializing")
    const httpServer: NetServer = res.socket.server as any
    const io = new ServerIO(httpServer, {
      path: "/api/socket/io",
      addTrailingSlash: false,
      cors: {
        origin: "*",
        methods: ["GET", "POST"]
      }
    })

    // Handle socket connections
    io.on("connection", (socket) => {
      console.log("Client connected:", socket.id)

      // Join user to their personal room
      socket.on("join-user-room", (userId: string) => {
        socket.join(`user-${userId}`)
        console.log(`User ${userId} joined their room`)
      })

      // Handle symbol subscriptions
      socket.on("subscribe-symbol", (data: { symbol: string, userId: string }) => {
        const room = `symbol-${data.symbol}`
        socket.join(room)
        console.log(`User ${data.userId} subscribed to ${data.symbol}`)
      })

      // Handle symbol unsubscriptions
      socket.on("unsubscribe-symbol", (data: { symbol: string, userId: string }) => {
        const room = `symbol-${data.symbol}`
        socket.leave(room)
        console.log(`User ${data.userId} unsubscribed from ${data.symbol}`)
      })

      // Handle disconnection
      socket.on("disconnect", () => {
        console.log("Client disconnected:", socket.id)
      })
    })

    // Store io instance on the server
    res.socket.server.io = io
  }
  res.end()
}

export default SocketHandler