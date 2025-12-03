/**
 * Advanced Anti-Bot & Brute Force Protection
 * Combines multiple techniques for maximum security
 */

import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'

interface LoginAttempt {
    ip: string
    email: string
    timestamp: number
    success: boolean
}

// In-memory stores (use Redis in production)
const loginAttempts = new Map<string, LoginAttempt[]>()
const rateLimits = new Map<string, { count: number; resetAt: number }>()
const suspiciousIPs = new Set<string>()

export class AdvancedSecurityService {

    /**
     * Comprehensive bot detection
     */
    async detectBot(req: NextRequest): Promise<{ isBot: boolean; reason?: string }> {
        const userAgent = req.headers.get('user-agent') || ''
        const ip = this.getClientIP(req)

        // 1. Allow legitimate crawlers (Google, Bing)
        if (this.isLegitimateBot(userAgent)) {
            return { isBot: false }
        }

        // 2. Check for malicious bot patterns
        const maliciousPatterns = [
            /bot/i,
            /crawler/i,
            /spider/i,
            /scraper/i,
            /curl/i,
            /wget/i,
            /python-requests/i,
            /java(?!script)/i,
            /go-http-client/i,
            /axios/i,
            /node-fetch/i
        ]

        if (maliciousPatterns.some(pattern => pattern.test(userAgent))) {
            return { isBot: true, reason: 'Suspicious user agent' }
        }

        // 3. Check for missing browser headers
        const requiredHeaders = [
            'accept',
            'accept-language',
            'accept-encoding',
            'sec-fetch-site',
            'sec-fetch-mode'
        ]

        const missingHeaders = requiredHeaders.filter(h => !req.headers.get(h))
        if (missingHeaders.length > 2) {
            return { isBot: true, reason: 'Missing browser headers' }
        }

        // 4. Check for suspicious header combinations
        const accept = req.headers.get('accept') || ''
        if (!accept.includes('text/html') && !accept.includes('application/json')) {
            return { isBot: true, reason: 'Invalid accept header' }
        }

        // 5. Check request frequency
        const isRateLimited = await this.checkRateLimit(ip, 100, 60000) // 100 req/min
        if (!isRateLimited) {
            return { isBot: true, reason: 'Rate limit exceeded' }
        }

        // 6. Check if IP is in suspicious list
        if (suspiciousIPs.has(ip)) {
            return { isBot: true, reason: 'Suspicious IP' }
        }

        return { isBot: false }
    }

    /**
     * Brute force protection for login
     */
    async checkBruteForce(email: string, ip: string): Promise<{ allowed: boolean; waitTime?: number }> {
        const key = `${ip}:${email}`
        const attempts = loginAttempts.get(key) || []

        // Clean old attempts (older than 15 minutes)
        const recentAttempts = attempts.filter(a => Date.now() - a.timestamp < 15 * 60 * 1000)

        // Count failed attempts in last 15 minutes
        const failedAttempts = recentAttempts.filter(a => !a.success).length

        // Progressive delays
        if (failedAttempts >= 10) {
            // Block for 1 hour after 10 failed attempts
            const lastAttempt = recentAttempts[recentAttempts.length - 1]
            const waitTime = (60 * 60 * 1000) - (Date.now() - lastAttempt.timestamp)

            if (waitTime > 0) {
                await this.logSecurityEvent(ip, 'brute_force_blocked', { email, attempts: failedAttempts })
                return { allowed: false, waitTime }
            }
        } else if (failedAttempts >= 5) {
            // 30 second delay after 5 failed attempts
            const lastAttempt = recentAttempts[recentAttempts.length - 1]
            const waitTime = 30000 - (Date.now() - lastAttempt.timestamp)

            if (waitTime > 0) {
                return { allowed: false, waitTime }
            }
        } else if (failedAttempts >= 3) {
            // 10 second delay after 3 failed attempts
            const lastAttempt = recentAttempts[recentAttempts.length - 1]
            const waitTime = 10000 - (Date.now() - lastAttempt.timestamp)

            if (waitTime > 0) {
                return { allowed: false, waitTime }
            }
        }

        return { allowed: true }
    }

    /**
     * Record login attempt
     */
    recordLoginAttempt(email: string, ip: string, success: boolean) {
        const key = `${ip}:${email}`
        const attempts = loginAttempts.get(key) || []

        attempts.push({
            ip,
            email,
            timestamp: Date.now(),
            success
        })

        loginAttempts.set(key, attempts)

        // Mark IP as suspicious after multiple failures
        if (!success) {
            const recentFailures = attempts.filter(a => !a.success && Date.now() - a.timestamp < 60000).length
            if (recentFailures >= 5) {
                suspiciousIPs.add(ip)
            }
        }
    }

    /**
     * Rate limiting
     */
    async checkRateLimit(identifier: string, maxRequests: number, windowMs: number): Promise<boolean> {
        const now = Date.now()
        const record = rateLimits.get(identifier)

        if (!record || now > record.resetAt) {
            rateLimits.set(identifier, {
                count: 1,
                resetAt: now + windowMs
            })
            return true
        }

        if (record.count >= maxRequests) {
            await this.logSecurityEvent(identifier, 'rate_limit_exceeded', { count: record.count })
            return false
        }

        record.count++
        return true
    }

    /**
     * Check if bot is legitimate (Google, Bing, etc.)
     */
    private isLegitimateBot(userAgent: string): boolean {
        const legitimateBots = [
            /googlebot/i,
            /bingbot/i,
            /slurp/i, // Yahoo
            /duckduckbot/i,
            /baiduspider/i,
            /yandexbot/i,
            /facebookexternalhit/i,
            /twitterbot/i,
            /linkedinbot/i
        ]

        return legitimateBots.some(pattern => pattern.test(userAgent))
    }

    /**
     * Get client IP address
     */
    private getClientIP(req: NextRequest): string {
        return (
            req.headers.get('x-forwarded-for')?.split(',')[0] ||
            req.headers.get('x-real-ip') ||
            req.headers.get('cf-connecting-ip') || // Cloudflare
            'unknown'
        )
    }

    /**
     * Log security events
     */
    private async logSecurityEvent(identifier: string, event: string, metadata: any) {
        try {
            await prisma.securityLog.create({
                data: {
                    ip: identifier,
                    reason: event,
                    details: metadata,
                    timestamp: new Date()
                }
            })

            // Auto-block after threshold
            const recentEvents = await prisma.securityLog.count({
                where: {
                    ip: identifier,
                    timestamp: {
                        gte: new Date(Date.now() - 60 * 60 * 1000) // Last hour
                    }
                }
            })

            if (recentEvents >= 10) {
                await prisma.blockedIP.create({
                    data: {
                        ip: identifier,
                        reason: `Auto-blocked: ${recentEvents} security events in 1 hour`,
                        blockedAt: new Date(),
                        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours
                    }
                })
            }
        } catch (error) {
            console.error('Failed to log security event:', error)
        }
    }

    /**
     * Check if IP is blocked
     */
    async isIPBlocked(ip: string): Promise<boolean> {
        const blocked = await prisma.blockedIP.findUnique({
            where: { ip }
        })

        if (!blocked) return false

        // Check if block has expired
        if (blocked.expiresAt && blocked.expiresAt < new Date()) {
            await prisma.blockedIP.delete({ where: { ip } })
            return false
        }

        return true
    }

    /**
     * CAPTCHA verification (for future integration)
     */
    async verifyCaptcha(token: string): Promise<boolean> {
        // Integrate with hCaptcha or reCAPTCHA
        // For now, return true
        return true
    }
}

export const advancedSecurityService = new AdvancedSecurityService()
