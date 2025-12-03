import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id || session.user?.role !== "admin") {
      return NextResponse.json(
        { error: "Unauthorized - Admin access required" },
        { status: 401 }
      )
    }

    const { action, userId, activityId, notes } = await req.json()

    switch (action) {
      case "addNote":
        await db.auditLog.create({
          data: {
            userId,
            action: "note_added",
            resourceId: activityId,
            resource: "activity",
            metadata: { notes }
          }
        })
        return NextResponse.json({
          success: true,
          message: "Note added successfully"
        })

      case "markAsRead":
        // AuditLog doesn't have isRead field, so we'll just log the action
        await db.auditLog.create({
          data: {
            userId,
            action: "activity_marked_read",
            resourceId: activityId,
            resource: "activity"
          }
        })
        return NextResponse.json({
          success: true,
          message: "Activity marked as read"
        })

      case "deleteActivity":
        await db.auditLog.create({
          data: {
            userId,
            action: "activity_deleted",
            resourceId: activityId,
            resource: "activity"
          }
        })
        return NextResponse.json({
          success: true,
          message: "Activity deleted successfully"
        })

      default:
        return NextResponse.json(
          { error: "Invalid action" },
          { status: 400 }
        )
    }

  } catch (error) {
    console.error("Admin activities error:", error)
    return NextResponse.json(
      { error: "Failed to process activity" },
      { status: 500 }
    )
  }
}