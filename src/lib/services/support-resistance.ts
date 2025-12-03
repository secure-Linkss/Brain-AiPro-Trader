/**
 * Support & Resistance Service
 * Manage key price levels
 */

import { prisma } from '@/lib/prisma'

export class SupportResistanceService {

    /**
     * Update S/R levels for a symbol
     */
    async updateLevels(symbol: string, timeframe: string, levels: { price: number, type: 'support' | 'resistance', strength: number }[]) {
        const tradingPair = await prisma.tradingPair.findFirst({ where: { symbol } })
        if (!tradingPair) return

        // Deactivate old levels
        await prisma.supportResistance.updateMany({
            where: { tradingPairId: tradingPair.id, timeframe, isActive: true },
            data: { isActive: false }
        })

        // Create new levels
        await prisma.supportResistance.createMany({
            data: levels.map(l => ({
                tradingPairId: tradingPair.id,
                level: l.price,
                type: l.type,
                strength: l.strength,
                timeframe,
                firstTested: new Date(),
                lastTested: new Date(),
                isActive: true
            }))
        })
    }

    /**
     * Get active levels
     */
    async getActiveLevels(symbol: string, timeframe: string) {
        return await prisma.supportResistance.findMany({
            where: {
                tradingPair: { symbol },
                timeframe,
                isActive: true
            },
            orderBy: { level: 'asc' }
        })
    }

    /**
     * Check if price is near a level
     */
    async checkProximity(symbol: string, price: number, tolerancePercent: number = 0.1) {
        const levels = await prisma.supportResistance.findMany({
            where: { tradingPair: { symbol }, isActive: true }
        })

        const tolerance = price * (tolerancePercent / 100)

        return levels.filter(l => Math.abs(l.level - price) <= tolerance)
    }
}

export const supportResistanceService = new SupportResistanceService()
