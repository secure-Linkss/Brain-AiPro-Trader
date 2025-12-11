/**
 * Trading Pairs Configuration
 * 
 * 33-Instrument Master List
 * Comprehensive coverage of forex, commodities, crypto, and indices
 */

export interface TradingPairConfig {
    symbol: string
    name: string
    type: 'forex' | 'commodity' | 'crypto' | 'index'
    exchange: string
    category: string
    isActive: boolean
    yfinanceSymbol?: string // Symbol format for yfinance API
    displaySymbol?: string  // Symbol format for display
}

/**
 * Forex – USD Majors (5 pairs)
 */
export const FOREX_USD_MAJORS: TradingPairConfig[] = [
    {
        symbol: 'EURUSD',
        name: 'Euro / US Dollar',
        type: 'forex',
        exchange: 'FX',
        category: 'USD Majors',
        isActive: true,
        yfinanceSymbol: 'EURUSD=X',
        displaySymbol: 'EUR/USD',
    },
    {
        symbol: 'GBPUSD',
        name: 'British Pound / US Dollar',
        type: 'forex',
        exchange: 'FX',
        category: 'USD Majors',
        isActive: true,
        yfinanceSymbol: 'GBPUSD=X',
        displaySymbol: 'GBP/USD',
    },
    {
        symbol: 'USDJPY',
        name: 'US Dollar / Japanese Yen',
        type: 'forex',
        exchange: 'FX',
        category: 'USD Majors',
        isActive: true,
        yfinanceSymbol: 'USDJPY=X',
        displaySymbol: 'USD/JPY',
    },
    {
        symbol: 'USDCHF',
        name: 'US Dollar / Swiss Franc',
        type: 'forex',
        exchange: 'FX',
        category: 'USD Majors',
        isActive: true,
        yfinanceSymbol: 'USDCHF=X',
        displaySymbol: 'USD/CHF',
    },
    {
        symbol: 'USDCAD',
        name: 'US Dollar / Canadian Dollar',
        type: 'forex',
        exchange: 'FX',
        category: 'USD Majors',
        isActive: true,
        yfinanceSymbol: 'USDCAD=X',
        displaySymbol: 'USD/CAD',
    },
]

/**
 * Forex – EUR Crosses (4 pairs)
 */
export const FOREX_EUR_CROSSES: TradingPairConfig[] = [
    {
        symbol: 'EURGBP',
        name: 'Euro / British Pound',
        type: 'forex',
        exchange: 'FX',
        category: 'EUR Crosses',
        isActive: true,
        yfinanceSymbol: 'EURGBP=X',
        displaySymbol: 'EUR/GBP',
    },
    {
        symbol: 'EURJPY',
        name: 'Euro / Japanese Yen',
        type: 'forex',
        exchange: 'FX',
        category: 'EUR Crosses',
        isActive: true,
        yfinanceSymbol: 'EURJPY=X',
        displaySymbol: 'EUR/JPY',
    },
    {
        symbol: 'EURCHF',
        name: 'Euro / Swiss Franc',
        type: 'forex',
        exchange: 'FX',
        category: 'EUR Crosses',
        isActive: true,
        yfinanceSymbol: 'EURCHF=X',
        displaySymbol: 'EUR/CHF',
    },
    {
        symbol: 'EURCAD',
        name: 'Euro / Canadian Dollar',
        type: 'forex',
        exchange: 'FX',
        category: 'EUR Crosses',
        isActive: true,
        yfinanceSymbol: 'EURCAD=X',
        displaySymbol: 'EUR/CAD',
    },
]

/**
 * Forex – GBP Crosses (3 pairs)
 */
export const FOREX_GBP_CROSSES: TradingPairConfig[] = [
    {
        symbol: 'GBPJPY',
        name: 'British Pound / Japanese Yen',
        type: 'forex',
        exchange: 'FX',
        category: 'GBP Crosses',
        isActive: true,
        yfinanceSymbol: 'GBPJPY=X',
        displaySymbol: 'GBP/JPY',
    },
    {
        symbol: 'GBPCHF',
        name: 'British Pound / Swiss Franc',
        type: 'forex',
        exchange: 'FX',
        category: 'GBP Crosses',
        isActive: true,
        yfinanceSymbol: 'GBPCHF=X',
        displaySymbol: 'GBP/CHF',
    },
    {
        symbol: 'GBPCAD',
        name: 'British Pound / Canadian Dollar',
        type: 'forex',
        exchange: 'FX',
        category: 'GBP Crosses',
        isActive: true,
        yfinanceSymbol: 'GBPCAD=X',
        displaySymbol: 'GBP/CAD',
    },
]

/**
 * Forex – CHF/JPY/CAD Crosses (3 pairs)
 */
export const FOREX_OTHER_CROSSES: TradingPairConfig[] = [
    {
        symbol: 'CHFJPY',
        name: 'Swiss Franc / Japanese Yen',
        type: 'forex',
        exchange: 'FX',
        category: 'Other Crosses',
        isActive: true,
        yfinanceSymbol: 'CHFJPY=X',
        displaySymbol: 'CHF/JPY',
    },
    {
        symbol: 'CADJPY',
        name: 'Canadian Dollar / Japanese Yen',
        type: 'forex',
        exchange: 'FX',
        category: 'Other Crosses',
        isActive: true,
        yfinanceSymbol: 'CADJPY=X',
        displaySymbol: 'CAD/JPY',
    },
    {
        symbol: 'CADCHF',
        name: 'Canadian Dollar / Swiss Franc',
        type: 'forex',
        exchange: 'FX',
        category: 'Other Crosses',
        isActive: true,
        yfinanceSymbol: 'CADCHF=X',
        displaySymbol: 'CAD/CHF',
    },
]

/**
 * High-Volatility Forex (1 pair)
 */
export const FOREX_HIGH_VOLATILITY: TradingPairConfig[] = [
    {
        symbol: 'USDZAR',
        name: 'US Dollar / South African Rand',
        type: 'forex',
        exchange: 'FX',
        category: 'High Volatility',
        isActive: true,
        yfinanceSymbol: 'USDZAR=X',
        displaySymbol: 'USD/ZAR',
    },
]

/**
 * Commodities (2 pairs)
 */
export const COMMODITIES: TradingPairConfig[] = [
    {
        symbol: 'XAUUSD',
        name: 'Gold / US Dollar',
        type: 'commodity',
        exchange: 'COMEX',
        category: 'Precious Metals',
        isActive: true,
        yfinanceSymbol: 'GC=F',
        displaySymbol: 'XAU/USD',
    },
    {
        symbol: 'XAGUSD',
        name: 'Silver / US Dollar',
        type: 'commodity',
        exchange: 'COMEX',
        category: 'Precious Metals',
        isActive: true,
        yfinanceSymbol: 'SI=F',
        displaySymbol: 'XAG/USD',
    },
]

/**
 * Crypto – Major + High Volatility (12 pairs)
 */
export const CRYPTO: TradingPairConfig[] = [
    {
        symbol: 'BTCUSD',
        name: 'Bitcoin / US Dollar',
        type: 'crypto',
        exchange: 'Binance',
        category: 'Major Crypto',
        isActive: true,
        yfinanceSymbol: 'BTC-USD',
        displaySymbol: 'BTC/USD',
    },
    {
        symbol: 'ETHUSD',
        name: 'Ethereum / US Dollar',
        type: 'crypto',
        exchange: 'Binance',
        category: 'Major Crypto',
        isActive: true,
        yfinanceSymbol: 'ETH-USD',
        displaySymbol: 'ETH/USD',
    },
    {
        symbol: 'LTCUSD',
        name: 'Litecoin / US Dollar',
        type: 'crypto',
        exchange: 'Binance',
        category: 'Major Crypto',
        isActive: true,
        yfinanceSymbol: 'LTC-USD',
        displaySymbol: 'LTC/USD',
    },
    {
        symbol: 'SOLUSD',
        name: 'Solana / US Dollar',
        type: 'crypto',
        exchange: 'Binance',
        category: 'High Volatility Crypto',
        isActive: true,
        yfinanceSymbol: 'SOL-USD',
        displaySymbol: 'SOL/USD',
    },
    {
        symbol: 'XRPUSD',
        name: 'Ripple / US Dollar',
        type: 'crypto',
        exchange: 'Binance',
        category: 'Major Crypto',
        isActive: true,
        yfinanceSymbol: 'XRP-USD',
        displaySymbol: 'XRP/USD',
    },
    {
        symbol: 'ADAUSD',
        name: 'Cardano / US Dollar',
        type: 'crypto',
        exchange: 'Binance',
        category: 'High Volatility Crypto',
        isActive: true,
        yfinanceSymbol: 'ADA-USD',
        displaySymbol: 'ADA/USD',
    },
    {
        symbol: 'AVAXUSD',
        name: 'Avalanche / US Dollar',
        type: 'crypto',
        exchange: 'Binance',
        category: 'High Volatility Crypto',
        isActive: true,
        yfinanceSymbol: 'AVAX-USD',
        displaySymbol: 'AVAX/USD',
    },
    {
        symbol: 'DOGEUSD',
        name: 'Dogecoin / US Dollar',
        type: 'crypto',
        exchange: 'Binance',
        category: 'High Volatility Crypto',
        isActive: true,
        yfinanceSymbol: 'DOGE-USD',
        displaySymbol: 'DOGE/USD',
    },
    {
        symbol: 'MATICUSD',
        name: 'Polygon / US Dollar',
        type: 'crypto',
        exchange: 'Binance',
        category: 'High Volatility Crypto',
        isActive: true,
        yfinanceSymbol: 'MATIC-USD',
        displaySymbol: 'MATIC/USD',
    },
    {
        symbol: 'DOTUSD',
        name: 'Polkadot / US Dollar',
        type: 'crypto',
        exchange: 'Binance',
        category: 'High Volatility Crypto',
        isActive: true,
        yfinanceSymbol: 'DOT-USD',
        displaySymbol: 'DOT/USD',
    },
    {
        symbol: 'BNBUSD',
        name: 'Binance Coin / US Dollar',
        type: 'crypto',
        exchange: 'Binance',
        category: 'Major Crypto',
        isActive: true,
        yfinanceSymbol: 'BNB-USD',
        displaySymbol: 'BNB/USD',
    },
    {
        symbol: 'LINKUSD',
        name: 'Chainlink / US Dollar',
        type: 'crypto',
        exchange: 'Binance',
        category: 'High Volatility Crypto',
        isActive: true,
        yfinanceSymbol: 'LINK-USD',
        displaySymbol: 'LINK/USD',
    },
]

/**
 * Indices (3 pairs)
 */
export const INDICES: TradingPairConfig[] = [
    {
        symbol: 'US30',
        name: 'Dow Jones Industrial Average',
        type: 'index',
        exchange: 'CBOT',
        category: 'US Indices',
        isActive: true,
        yfinanceSymbol: '^DJI',
        displaySymbol: 'US30',
    },
    {
        symbol: 'NAS100',
        name: 'Nasdaq 100',
        type: 'index',
        exchange: 'CME',
        category: 'US Indices',
        isActive: true,
        yfinanceSymbol: '^NDX',
        displaySymbol: 'NAS100',
    },
    {
        symbol: 'SPX500',
        name: 'S&P 500',
        type: 'index',
        exchange: 'CME',
        category: 'US Indices',
        isActive: true,
        yfinanceSymbol: '^GSPC',
        displaySymbol: 'SPX500',
    },
]

/**
 * All 33 trading pairs combined
 */
export const ALL_TRADING_PAIRS: TradingPairConfig[] = [
    ...FOREX_USD_MAJORS,
    ...FOREX_EUR_CROSSES,
    ...FOREX_GBP_CROSSES,
    ...FOREX_OTHER_CROSSES,
    ...FOREX_HIGH_VOLATILITY,
    ...COMMODITIES,
    ...CRYPTO,
    ...INDICES,
]

/**
 * Trading pairs grouped by type
 */
export const TRADING_PAIRS_BY_TYPE = {
    forex: [
        ...FOREX_USD_MAJORS,
        ...FOREX_EUR_CROSSES,
        ...FOREX_GBP_CROSSES,
        ...FOREX_OTHER_CROSSES,
        ...FOREX_HIGH_VOLATILITY,
    ],
    commodity: COMMODITIES,
    crypto: CRYPTO,
    index: INDICES,
} as const

/**
 * Trading pairs grouped by category
 */
export const TRADING_PAIRS_BY_CATEGORY = {
    'USD Majors': FOREX_USD_MAJORS,
    'EUR Crosses': FOREX_EUR_CROSSES,
    'GBP Crosses': FOREX_GBP_CROSSES,
    'Other Crosses': FOREX_OTHER_CROSSES,
    'High Volatility': FOREX_HIGH_VOLATILITY,
    'Precious Metals': COMMODITIES,
    'Major Crypto': CRYPTO.filter(c => c.category === 'Major Crypto'),
    'High Volatility Crypto': CRYPTO.filter(c => c.category === 'High Volatility Crypto'),
    'US Indices': INDICES,
} as const

/**
 * Helper function to get trading pair by symbol
 */
export function getTradingPair(symbol: string): TradingPairConfig | undefined {
    return ALL_TRADING_PAIRS.find(pair => pair.symbol === symbol)
}

/**
 * Helper function to get yfinance symbol
 */
export function getYfinanceSymbol(symbol: string): string | undefined {
    const pair = getTradingPair(symbol)
    return pair?.yfinanceSymbol
}

/**
 * Helper function to get display symbol
 */
export function getDisplaySymbol(symbol: string): string {
    const pair = getTradingPair(symbol)
    return pair?.displaySymbol || symbol
}

/**
 * Helper function to get pairs by type
 */
export function getPairsByType(type: 'forex' | 'commodity' | 'crypto' | 'index'): TradingPairConfig[] {
    return ALL_TRADING_PAIRS.filter(pair => pair.type === type)
}

/**
 * Helper function to get active pairs only
 */
export function getActivePairs(): TradingPairConfig[] {
    return ALL_TRADING_PAIRS.filter(pair => pair.isActive)
}

/**
 * Total count of instruments
 */
export const TOTAL_INSTRUMENTS = ALL_TRADING_PAIRS.length // Should be 33
