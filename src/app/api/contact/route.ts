import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const contactSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  subject: z.string().min(5),
  message: z.string().min(10)
})

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { name, email, subject, message } = contactSchema.parse(body)

    const contactMessage = await prisma.contactMessage.create({
      data: {
        name,
        email,
        subject,
        message,
        status: 'unread'
      }
    })

    return NextResponse.json({ success: true, messageId: contactMessage.id })
  } catch (error) {
    console.error('Contact submission failed:', error)
    return NextResponse.json(
      { error: 'Failed to submit message' },
      { status: 500 }
    )
  }
}