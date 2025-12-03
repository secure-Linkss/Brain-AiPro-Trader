/**
 * Notification Service
 * Unified interface for sending notifications across all channels
 */

import { prisma } from '@/lib/prisma'
import { emailService } from './email-service'
import { smsService } from './sms-service'
import { telegramService } from './telegram-service'

export class NotificationService {

    /**
     * Broadcast a signal to all subscribed users
     */
    async broadcastSignal(signal: any) {
        // Get all users who want signal notifications
        // In a real app, you'd filter by subscription status and specific pair preferences
        const users = await prisma.user.findMany({
            where: {
                // active subscription check would go here
            },
            include: {
                telegramConfig: true,
                notificationPreferences: true
            }
        })

        console.log(`Broadcasting signal to ${users.length} users`)

        // Send in parallel (with batching in production)
        await Promise.all(users.map(async (user) => {
            try {
                // 1. In-App Notification (Always create)
                await prisma.notification.create({
                    data: {
                        userId: user.id,
                        type: 'signal',
                        title: `New Signal: ${signal.tradingPair.symbol}`,
                        message: `${signal.type} ${signal.tradingPair.symbol} @ ${signal.entryPrice}`,
                        metadata: { signalId: signal.id }
                    }
                })

                // 2. Telegram
                if (user.telegramConfig?.isEnabled && user.telegramConfig?.notifySignals) {
                    await telegramService.sendSignalAlert(user.id, signal)
                }

                // 3. Email
                await emailService.sendSignalAlert(user, signal)

                // 4. SMS
                await smsService.sendSignalAlert(user, signal)

            } catch (error) {
                console.error(`Failed to notify user ${user.id}`, error)
            }
        }))
    }

    /**
     * Send a system alert to a specific user
     */
    async sendSystemAlert(userId: string, title: string, message: string, level: 'info' | 'warning' | 'error' = 'info') {
        const user = await prisma.user.findUnique({ where: { id: userId } })
        if (!user) return

        // In-App
        await prisma.notification.create({
            data: {
                userId,
                type: 'system',
                title,
                message,
                read: false
            }
        })

        // Email (if critical)
        if (level === 'error') {
            await emailService.sendEmail({
                to: user.email,
                subject: `Alert: ${title}`,
                html: `<p>${message}</p>`
            })
        }
    }
}

export const notificationService = new NotificationService()
