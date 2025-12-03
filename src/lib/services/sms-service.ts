/**
 * SMS Service
 * Handles sending SMS notifications via Twilio
 */

import { prisma } from '@/lib/prisma'

export class SmsService {

    /**
     * Send an SMS
     */
    async sendSms(to: string, body: string) {
        // In production, use Twilio
        // For now, we'll log it and simulate success
        console.log(`[SmsService] Sending to ${to}: ${body}`)

        // Simulate API call
        return true
    }

    /**
     * Send signal alert SMS
     */
    async sendSignalAlert(user: { phone?: string | null, id: string }, signal: any) {
        if (!user.phone) return

        // Check preferences
        const pref = await prisma.notificationPreference.findUnique({
            where: {
                userId_type: {
                    userId: user.id,
                    type: 'signal'
                }
            }
        })

        if (!pref || !pref.sms) return

        const message = `BrainAiPro: ${signal.type} ${signal.tradingPair.symbol} @ ${signal.entryPrice}. SL: ${signal.stopLoss}, TP: ${signal.takeProfit1}. Conf: ${signal.strength}%`

        await this.sendSms(user.phone, message)
    }
}

export const smsService = new SmsService()
