/**
 * Trading Timeframes Configuration
 * 
 * Standardized timeframes used across the platform for:
 * - Multi-timeframe confluence analysis
 * - Signal generation
 * - Chart display
 * - Backtesting
 */

export const TIMEFRAMES = {
    // Display names
    FIVE_MIN: '5m',
    FIFTEEN_MIN: '15m',
    THIRTY_MIN: '30m',
    ONE_HOUR: '1hr',
    FOUR_HOUR: '4hr',
    ONE_DAY: '1d',
    ONE_WEEK: '1wk',
} as const

export type Timeframe = typeof TIMEFRAMES[keyof typeof TIMEFRAMES]

/**
 * All supported timeframes in order (shortest to longest)
 */
export const ALL_TIMEFRAMES: Timeframe[] = [
    TIMEFRAMES.FIVE_MIN,
    TIMEFRAMES.FIFTEEN_MIN,
    TIMEFRAMES.THIRTY_MIN,
    TIMEFRAMES.ONE_HOUR,
    TIMEFRAMES.FOUR_HOUR,
    TIMEFRAMES.ONE_DAY,
    TIMEFRAMES.ONE_WEEK,
]

/**
 * Timeframe display labels for UI
 */
export const TIMEFRAME_LABELS: Record<Timeframe, string> = {
    [TIMEFRAMES.FIVE_MIN]: '5 Minutes',
    [TIMEFRAMES.FIFTEEN_MIN]: '15 Minutes',
    [TIMEFRAMES.THIRTY_MIN]: '30 Minutes',
    [TIMEFRAMES.ONE_HOUR]: '1 Hour',
    [TIMEFRAMES.FOUR_HOUR]: '4 Hours',
    [TIMEFRAMES.ONE_DAY]: '1 Day',
    [TIMEFRAMES.ONE_WEEK]: '1 Week',
}

/**
 * Timeframe to minutes conversion
 * Used for calculations and comparisons
 */
export const TIMEFRAME_MINUTES: Record<Timeframe, number> = {
    [TIMEFRAMES.FIVE_MIN]: 5,
    [TIMEFRAMES.FIFTEEN_MIN]: 15,
    [TIMEFRAMES.THIRTY_MIN]: 30,
    [TIMEFRAMES.ONE_HOUR]: 60,
    [TIMEFRAMES.FOUR_HOUR]: 240,
    [TIMEFRAMES.ONE_DAY]: 1440,
    [TIMEFRAMES.ONE_WEEK]: 10080,
}

/**
 * Timeframe to yfinance interval mapping
 * Used for fetching historical data
 */
export const TIMEFRAME_TO_YFINANCE: Record<Timeframe, string> = {
    [TIMEFRAMES.FIVE_MIN]: '5m',
    [TIMEFRAMES.FIFTEEN_MIN]: '15m',
    [TIMEFRAMES.THIRTY_MIN]: '30m',
    [TIMEFRAMES.ONE_HOUR]: '1h',
    [TIMEFRAMES.FOUR_HOUR]: '4h',
    [TIMEFRAMES.ONE_DAY]: '1d',
    [TIMEFRAMES.ONE_WEEK]: '1wk',
}

/**
 * Timeframe to TradingView interval mapping
 * Used for TradingView widgets
 */
export const TIMEFRAME_TO_TRADINGVIEW: Record<Timeframe, string> = {
    [TIMEFRAMES.FIVE_MIN]: '5',
    [TIMEFRAMES.FIFTEEN_MIN]: '15',
    [TIMEFRAMES.THIRTY_MIN]: '30',
    [TIMEFRAMES.ONE_HOUR]: '60',
    [TIMEFRAMES.FOUR_HOUR]: '240',
    [TIMEFRAMES.ONE_DAY]: 'D',
    [TIMEFRAMES.ONE_WEEK]: 'W',
}

/**
 * Recommended lookback periods for each timeframe
 * Used for historical data fetching
 */
export const TIMEFRAME_LOOKBACK_DAYS: Record<Timeframe, number> = {
    [TIMEFRAMES.FIVE_MIN]: 7,      // 1 week for 5min
    [TIMEFRAMES.FIFTEEN_MIN]: 14,  // 2 weeks for 15min
    [TIMEFRAMES.THIRTY_MIN]: 30,   // 1 month for 30min
    [TIMEFRAMES.ONE_HOUR]: 60,     // 2 months for 1hr
    [TIMEFRAMES.FOUR_HOUR]: 180,   // 6 months for 4hr
    [TIMEFRAMES.ONE_DAY]: 365,     // 1 year for 1d
    [TIMEFRAMES.ONE_WEEK]: 730,    // 2 years for 1wk
}

/**
 * Default timeframes for multi-timeframe analysis
 * Balanced selection for confluence analysis
 */
export const DEFAULT_MTF_TIMEFRAMES: Timeframe[] = [
    TIMEFRAMES.FIFTEEN_MIN,
    TIMEFRAMES.ONE_HOUR,
    TIMEFRAMES.FOUR_HOUR,
    TIMEFRAMES.ONE_DAY,
]

/**
 * Timeframe groups for UI organization
 */
export const TIMEFRAME_GROUPS = {
    INTRADAY: [
        TIMEFRAMES.FIVE_MIN,
        TIMEFRAMES.FIFTEEN_MIN,
        TIMEFRAMES.THIRTY_MIN,
        TIMEFRAMES.ONE_HOUR,
    ],
    SWING: [
        TIMEFRAMES.FOUR_HOUR,
        TIMEFRAMES.ONE_DAY,
    ],
    POSITION: [
        TIMEFRAMES.ONE_WEEK,
    ],
} as const

/**
 * Helper function to validate timeframe
 */
export function isValidTimeframe(timeframe: string): timeframe is Timeframe {
    return ALL_TIMEFRAMES.includes(timeframe as Timeframe)
}

/**
 * Helper function to get next higher timeframe
 */
export function getHigherTimeframe(timeframe: Timeframe): Timeframe | null {
    const index = ALL_TIMEFRAMES.indexOf(timeframe)
    if (index === -1 || index === ALL_TIMEFRAMES.length - 1) {
        return null
    }
    return ALL_TIMEFRAMES[index + 1]
}

/**
 * Helper function to get next lower timeframe
 */
export function getLowerTimeframe(timeframe: Timeframe): Timeframe | null {
    const index = ALL_TIMEFRAMES.indexOf(timeframe)
    if (index <= 0) {
        return null
    }
    return ALL_TIMEFRAMES[index - 1]
}

/**
 * Helper function to compare timeframes
 * Returns: -1 if tf1 < tf2, 0 if equal, 1 if tf1 > tf2
 */
export function compareTimeframes(tf1: Timeframe, tf2: Timeframe): number {
    const minutes1 = TIMEFRAME_MINUTES[tf1]
    const minutes2 = TIMEFRAME_MINUTES[tf2]
    return minutes1 < minutes2 ? -1 : minutes1 > minutes2 ? 1 : 0
}
