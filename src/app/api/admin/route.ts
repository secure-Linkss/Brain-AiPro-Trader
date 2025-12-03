import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id || session.user?.role !== "admin") {
      return NextResponse.json(
        { error: "Unauthorized - Admin access required" },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(req.url)
    const type = searchParams.get("type") || "stats"

    switch (type) {
      case "stats":
        // Check Python Backend Health
        const pythonBackendUrl = process.env.PYTHON_BACKEND_URL || "http://localhost:8003"
        let pythonHealth = "unknown"
        try {
          const res = await fetch(`${pythonBackendUrl}/`)
          if (res.ok) pythonHealth = "healthy"
          else pythonHealth = "degraded"
        } catch (e) {
          pythonHealth = "down"
        }

        // Get admin statistics
        const [
          totalUsers,
          activeUsers,
          premiumUsers,
          totalSignals,
          totalRevenue,
          monthlyRevenue,
          successRateAgg
        ] = await Promise.all([
          db.user.count(),
          db.user.count({
            where: {
              updatedAt: {
                gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // Last 30 days
              }
            }
          }),
          db.user.count({
            where: {
              role: "premium"
            }
          }),
          db.signal.count(),
          db.payment.aggregate({
            where: {
              status: "completed"
            },
            _sum: {
              amount: true
            }
          }),
          db.payment.aggregate({
            where: {
              status: "completed",
              createdAt: {
                gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // Last 30 days
              }
            },
            _sum: {
              amount: true
            }
          }),
          db.successRate.aggregate({
            _avg: { successRate: true }
          })
        ])

        const stats = {
          totalUsers,
          activeUsers,
          premiumUsers,
          totalSignals,
          totalRevenue: totalRevenue._sum.amount || 0,
          monthlyRevenue: monthlyRevenue._sum.amount || 0,
          successRate: successRateAgg._avg.successRate || 0,
          systemHealth: pythonHealth === "healthy" ? "healthy" : "degraded"
        }

        return NextResponse.json({
          success: true,
          stats
        })

      case "users":
        // Get all users with pagination
        const page = parseInt(searchParams.get("page") || "1")
        const limit = parseInt(searchParams.get("limit") || "20")
        const skip = (page - 1) * limit

        const users = await db.user.findMany({
          select: {
            id: true,
            email: true,
            name: true,
            role: true,
            subscriptionExpires: true,
            telegramEnabled: true,
            createdAt: true,
            updatedAt: true
          },
          orderBy: {
            createdAt: 'desc'
          },
          skip,
          take: limit
        })

        const totalUsersCount = await db.user.count()

        return NextResponse.json({
          success: true,
          users,
          pagination: {
            page,
            limit,
            total: totalUsersCount,
            pages: Math.ceil(totalUsersCount / limit)
          }
        })

      default:
        return NextResponse.json(
          { error: "Invalid type parameter" },
          { status: 400 }
        )
    }

  } catch (error) {
    console.error("Admin API error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id || session.user?.role !== "admin") {
      return NextResponse.json(
        { error: "Unauthorized - Admin access required" },
        { status: 401 }
      )
    }

    const { action, userId, role } = await req.json()

    switch (action) {
      case "updateUserRole":
        await db.user.update({
          where: { id: userId },
          data: { role }
        })
        return NextResponse.json({
          success: true,
          message: "User role updated successfully"
        })

      case "toggleTelegram":
        const user = await db.user.findUnique({ where: { id: userId } })
        if (!user) {
          return NextResponse.json({ error: "User not found" }, { status: 404 })
        }

        await db.user.update({
          where: { id: userId },
          data: { telegramEnabled: !user.telegramEnabled }
        })
        return NextResponse.json({
          success: true,
          message: "Telegram settings updated"
        })

      default:
        return NextResponse.json(
          { error: "Invalid action" },
          { status: 400 }
        )
    }

  } catch (error) {
    console.error("Admin POST error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}