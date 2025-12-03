import { NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { db } from "@/lib/db"
import { z } from "zod"

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  name: z.string().min(2),
  phone: z.string().optional(),
  country: z.string().optional(),
  selectedPlan: z.string().optional(),
  billingCycle: z.enum(["monthly", "annual"]).optional(),
  wantsNewsletter: z.boolean().optional()
})

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const {
      email,
      password,
      name,
      phone,
      country,
      selectedPlan,
      billingCycle,
      wantsNewsletter
    } = registerSchema.parse(body)

    // Check if user already exists
    const existingUser = await db.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      return NextResponse.json(
        { error: "User already exists" },
        { status: 400 }
      )
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12)

    // Create user with additional metadata
    const user = await db.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        metadata: {
          phone: phone || null,
          country: country || null,
          selectedPlan: selectedPlan || "starter",
          billingCycle: billingCycle || "monthly",
          wantsNewsletter: wantsNewsletter !== false,
          registrationDate: new Date().toISOString(),
          source: "web"
        }
      }
    })

    // Create audit log
    await db.auditLog.create({
      data: {
        userId: user.id,
        action: "user_registered",
        resource: "user",
        resourceId: user.id,
        metadata: {
          plan: selectedPlan || "starter",
          billingCycle: billingCycle || "monthly"
        }
      }
    })

    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        selectedPlan: selectedPlan || "starter"
      }
    })
  } catch (error) {
    console.error("Registration error:", error)
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid input data", details: error.issues },
        { status: 400 }
      )
    }
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}