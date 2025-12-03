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

    // Calculate start of current month for monthly revenue
    const startOfMonth = new Date()
    startOfMonth.setDate(1)
    startOfMonth.setHours(0, 0, 0, 0)

    // Parallelize DB queries for performance
    const [
      totalUsers,
      activeUsers,
      premiumUsers,
      totalRevenueResult,
      monthlyRevenueResult,
      totalSignals,
      successRateResult
    ] = await Promise.all([
      db.user.count(),
      db.user.count({ where: { lastActive: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } } }), // Active in last 30 days
      db.user.count({ where: { role: "premium" } }),
      db.payment.aggregate({ _sum: { amount: true }, where: { status: "completed" } }),
      db.payment.aggregate({ _sum: { amount: true }, where: { status: "completed", createdAt: { gte: startOfMonth } } }),
      db.signal.count(),
      db.signal.aggregate({ _avg: { successRate: true }, where: { status: "CLOSED" } })
    ])

    const stats = {
      totalUsers,
      activeUsers,
      premiumUsers,
      totalRevenue: totalRevenueResult._sum.amount || 0,
      monthlyRevenue: monthlyRevenueResult._sum.amount || 0,
      totalSignals,
      successRate: successRateResult._avg.successRate || 0,
      systemHealth: "healthy" // This could be dynamic based on error logs
    }

    return NextResponse.json({
      success: true,
      stats
    })

  } catch (error) {
    console.error("Admin stats error:", error)
    return NextResponse.json(
      { error: "Failed to fetch admin stats" },
      { status: 500 }
    )
  }
}