/**
 * Email Service
 * Handles sending transactional emails (welcome, alerts, password reset)
 */

import { prisma } from '@/lib/prisma'

interface EmailOptions {
    to: string
    subject: string
    html: string
}

export class EmailService {

    /**
     * Send an email
     */
    async sendEmail(options: EmailOptions) {
        // In production, use SendGrid, Mailgun, or AWS SES
        // For now, we'll log it and simulate success
        console.log(`[EmailService] Sending to ${options.to}: ${options.subject}`)

        // Simulate API call
        return true
    }

    /**
     * Send welcome email
     */
    async sendWelcomeEmail(user: { email: string, name: string }) {
        const html = `
      <h1>Welcome to Brain AiPro Trader, ${user.name}!</h1>
      <p>We're excited to have you on board.</p>
      <p>Get started by setting up your notification preferences in the dashboard.</p>
      <a href="${process.env.NEXT_PUBLIC_APP_URL}/settings">Go to Dashboard</a>
    `

        await this.sendEmail({
            to: user.email,
            subject: 'Welcome to Brain AiPro Trader',
            html
        })
    }

    /**
     * Send signal alert email
     */
    async sendSignalAlert(user: { email: string, id: string }, signal: any) {
        // Check preferences
        const pref = await prisma.notificationPreference.findUnique({
            where: {
                userId_type: {
                    userId: user.id,
                    type: 'signal'
                }
            }
        })

        if (pref && !pref.email) return

        const html = `
      <h2>New Signal: ${signal.tradingPair.symbol}</h2>
      <p><strong>Type:</strong> ${signal.type}</p>
      <p><strong>Entry:</strong> ${signal.entryPrice}</p>
      <p><strong>Stop Loss:</strong> ${signal.stopLoss}</p>
      <p><strong>Take Profit:</strong> ${signal.takeProfit1}</p>
      <p><strong>Confidence:</strong> ${signal.strength}%</p>
      <p><em>${signal.reason}</em></p>
    `

        await this.sendEmail({
            to: user.email,
            subject: `Signal Alert: ${signal.tradingPair.symbol} ${signal.type}`,
            html
        })
    }

    async sendContactReply(to: string, name: string, originalMessage: string, replyMessage: string) {
        // This method assumes a 'transporter' is available, which is not in the current EmailService.
        // For consistency with existing methods, we'll use `this.sendEmail`.
        // The original instruction's `if (!this.transporter) return` and `this.transporter.sendMail`
        // are adapted to the current class structure.

        const html = `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Hello ${name},</h2>
          <p>Thank you for contacting us. Here is our response to your message:</p>
          
          <div style="background-color: #f4f4f5; padding: 15px; border-left: 4px solid #3b82f6; margin: 20px 0;">
            <strong>Our Reply:</strong><br/>
            ${replyMessage.replace(/\n/g, '<br/>')}
          </div>

          <div style="color: #666; font-size: 0.9em; margin-top: 30px; border-top: 1px solid #eee; padding-top: 15px;">
            <strong>Your Original Message:</strong><br/>
            "${originalMessage}"
          </div>
          
          <p style="margin-top: 30px;">Best regards,<br/>The Brain AiPro Trader Team</p>
        </div>
      `

        await this.sendEmail({
            to,
            subject: 'Re: Your message to Brain AiPro Trader',
            html
        })
    }
}

export const emailService = new EmailService()
