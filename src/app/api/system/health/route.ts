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

    // Check Python Backend Health
    const pythonBackendUrl = process.env.PYTHON_BACKEND_URL || "http://localhost:8003"
    let pythonHealth = "unknown"
    try {
      const res = await fetch(`${pythonBackendUrl}/`) // Root endpoint usually returns hello or docs
      if (res.ok) pythonHealth = "healthy"
      else pythonHealth = "degraded"
    } catch (e) {
      pythonHealth = "down"
    }

    // Get system health status
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
            gte: new Date(Date.now() - 30 * 24 * 60 * 1000)
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
            gte: new Date(Date.now() - 30 * 24 * 60 * 1000)
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
      systemHealth: pythonHealth === "healthy" ? "healthy" : "degraded",
      pythonBackendStatus: pythonHealth,
      serverUptime: `${process.uptime().toFixed(0)}s`,
      lastCheck: new Date().toISOString()
    }

    return NextResponse.json({
      success: true,
      stats
    })

  } catch (error) {
    console.error("System health error:", error)
    return NextResponse.json(
      { error: "Failed to get system health" },
      { status: 500 }
    )
  }
}