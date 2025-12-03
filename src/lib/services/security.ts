/**
 * Advanced Security Middleware
 * - Rate Limiting
 * - Bot Detection
 * - SQL Injection Prevention
 * - XSS Protection
 * - CSRF Protection
 */

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// In-memory rate limit store (use Redis in production)
const rateLimitStore = new Map<string, { count: number; resetAt: number }>()

export class SecurityService {

    /**
     * Rate Limiting
     */
    async checkRateLimit(identifier: string, maxRequests: number = 100, windowMs: number = 60000): Promise<boolean> {
        const now = Date.now()
        const record = rateLimitStore.get(identifier)

        if (!record || now > record.resetAt) {
            rateLimitStore.set(identifier, {
                count: 1,
                resetAt: now + windowMs
            })
            return true
        }

        if (record.count >= maxRequests) {
            return false
        }

        record.count++
        return true
    }

    /**
     * Bot Detection
     * Checks for suspicious patterns
     */
    detectBot(req: NextRequest): boolean {
        const userAgent = req.headers.get('user-agent') || ''

        // Known bot patterns
        const botPatterns = [
            /bot/i,
            /crawler/i,
            /spider/i,
            /scraper/i,
            /curl/i,
            /wget/i,
            /python/i,
            /java(?!script)/i
        ]

        // Check if user agent matches bot patterns
        if (botPatterns.some(pattern => pattern.test(userAgent))) {
            return true
        }

        // Check for missing common headers
        const hasAccept = req.headers.get('accept')
        const hasAcceptLanguage = req.headers.get('accept-language')
        const hasAcceptEncoding = req.headers.get('accept-encoding')

        if (!hasAccept || !hasAcceptLanguage || !hasAcceptEncoding) {
            return true
        }

        return false
    }

    /**
     * SQL Injection Prevention
     * Sanitize input strings
     */
    sanitizeInput(input: string): string {
        // Remove dangerous SQL keywords and characters
        const dangerous = [
            /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|EXECUTE|UNION|DECLARE)\b)/gi,
            /(--|;|\/\*|\*\/|xp_|sp_)/gi,
            /('|(\\')|(--)|(\#)|(%)|(\+)|(\|))/gi
        ]

        let sanitized = input
        dangerous.forEach(pattern => {
            sanitized = sanitized.replace(pattern, '')
        })

        return sanitized.trim()
    }

    /**
     * XSS Protection
     * Escape HTML entities
     */
    escapeHtml(unsafe: string): string {
        return unsafe
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;")
    }

    /**
     * CSRF Token Generation
     */
    generateCSRFToken(): string {
        return Array.from(crypto.getRandomValues(new Uint8Array(32)))
            .map(b => b.toString(16).padStart(2, '0'))
            .join('')
    }

    /**
     * Validate CSRF Token
     */
    validateCSRFToken(token: string, sessionToken: string): boolean {
        return token === sessionToken
    }

    /**
     * IP-based blocking
     */
    async isIPBlocked(ip: string): Promise<boolean> {
        const blocked = await prisma.blockedIP.findUnique({
            where: { ip }
        })

        return !!blocked
    }

    /**
     * Log suspicious activity
     */
    async logSuspiciousActivity(ip: string, reason: string, details: any) {
        await prisma.securityLog.create({
            data: {
                ip,
                reason,
                details,
                timestamp: new Date()
            }
        })

        // Auto-block after 5 suspicious activities
        const recentLogs = await prisma.securityLog.count({
            where: {
                ip,
                timestamp: {
                    gte: new Date(Date.now() - 60 * 60 * 1000) // Last hour
                }
            }
        })

        if (recentLogs >= 5) {
            await prisma.blockedIP.create({
                data: {
                    ip,
                    reason: 'Automated blocking due to suspicious activity',
                    blockedAt: new Date()
                }
            })
        }
    }
}

export const securityService = new SecurityService()

/**
 * Middleware function to protect routes
 */
export async function securityMiddleware(req: NextRequest) {
    const ip = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown'

    // Check if IP is blocked
    if (await securityService.isIPBlocked(ip)) {
        return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    // Check rate limit
    if (!await securityService.checkRateLimit(ip)) {
        await securityService.logSuspiciousActivity(ip, 'Rate limit exceeded', {})
        return NextResponse.json({ error: 'Too many requests' }, { status: 429 })
    }

    // Detect bots
    if (securityService.detectBot(req)) {
        await securityService.logSuspiciousActivity(ip, 'Bot detected', { userAgent: req.headers.get('user-agent') })
        return NextResponse.json({ error: 'Bot detected' }, { status: 403 })
    }

    return null // Allow request
}
