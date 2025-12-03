import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { prisma } from '@/lib/prisma'
import { emailService } from '@/lib/services/email-service'

// GET: List all messages
export async function GET(req: Request) {
  const session = await getServerSession(authOptions)
  if (session?.user?.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const messages = await prisma.contactMessage.findMany({
    orderBy: { createdAt: 'desc' }
  })

  return NextResponse.json(messages)
}

// POST: Reply to a message
export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  if (session?.user?.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { messageId, reply } = await req.json()

    const originalMessage = await prisma.contactMessage.findUnique({
      where: { id: messageId }
    })

    if (!originalMessage) {
      return NextResponse.json({ error: 'Message not found' }, { status: 404 })
    }

    // Send email via SMTP
    await emailService.sendContactReply(
      originalMessage.email,
      originalMessage.name,
      originalMessage.message,
      reply
    )

    // Update database
    const updatedMessage = await prisma.contactMessage.update({
      where: { id: messageId },
      data: {
        status: 'replied',
        adminReply: reply,
        repliedAt: new Date(),
        repliedBy: session.user.email
      }
    })

    return NextResponse.json(updatedMessage)
  } catch (error) {
    console.error('Reply failed:', error)
    return NextResponse.json({ error: 'Failed to send reply' }, { status: 500 })
  }
}