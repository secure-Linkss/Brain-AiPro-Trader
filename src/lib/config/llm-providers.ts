/**
 * Multi-LLM Provider Configuration
 * Supports multiple AI providers with automatic rotation and fallback
 */

export interface LLMProvider {
    id: string
    name: string
    apiKey?: string
    baseUrl: string
    model: string
    enabled: boolean
    priority: number // Lower = higher priority
    isFree: boolean
    maxTokens: number
    temperature: number
    rateLimit: {
        requestsPerMinute: number
        requestsPerDay: number
    }
}

export interface LLMProviderConfig {
    providers: LLMProvider[]
    rotationStrategy: 'priority' | 'round-robin' | 'least-used' | 'fastest'
    fallbackEnabled: boolean
    timeout: number // milliseconds
}

// Default LLM Provider Configuration
export const DEFAULT_LLM_CONFIG: LLMProviderConfig = {
    providers: [
        // LOCAL LLM (No API key required, runs on your machine)
        {
            id: 'ollama-local',
            name: 'Ollama (Local - FREE)',
            baseUrl: process.env.OLLAMA_BASE_URL || 'http://localhost:11434',
            model: process.env.OLLAMA_MODEL || 'llama3.1:8b',
            enabled: true, // Always enabled, no API key needed
            priority: 0, // HIGHEST priority - use local LLM first
            isFree: true,
            maxTokens: 8000,
            temperature: 0.7,
            rateLimit: {
                requestsPerMinute: 999999, // No limits for local
                requestsPerDay: 999999
            }
        },

        // FREE PROVIDERS (No API key required or free tier)
        {
            id: 'groq',
            name: 'Groq (Free)',
            baseUrl: 'https://api.groq.com/openai/v1',
            model: 'llama-3.1-70b-versatile',
            enabled: !!(process.env.GROQ_API_KEY && process.env.GROQ_API_KEY !== 'gsk_free'),
            priority: 1,
            isFree: true,
            maxTokens: 8000,
            temperature: 0.7,
            rateLimit: {
                requestsPerMinute: 30,
                requestsPerDay: 14400
            }
        },
        {
            id: 'huggingface',
            name: 'HuggingFace Inference (Free)',
            baseUrl: 'https://api-inference.huggingface.co/models',
            model: 'meta-llama/Llama-2-70b-chat-hf',
            enabled: !!process.env.HUGGINGFACE_API_KEY,
            priority: 2,
            isFree: true,
            maxTokens: 4096,
            temperature: 0.7,
            rateLimit: {
                requestsPerMinute: 10,
                requestsPerDay: 1000
            }
        },
        {
            id: 'together',
            name: 'Together AI (Free Tier)',
            baseUrl: 'https://api.together.xyz/v1',
            model: 'meta-llama/Llama-3-70b-chat-hf',
            enabled: !!process.env.TOGETHER_API_KEY,
            priority: 3,
            isFree: true,
            maxTokens: 8000,
            temperature: 0.7,
            rateLimit: {
                requestsPerMinute: 60,
                requestsPerDay: 10000
            }
        },

        // PAID PROVIDERS (Require API keys)
        {
            id: 'google-gemini-flash-2.5',
            name: 'Google Gemini 2.5 Flash',
            apiKey: process.env.GOOGLE_GEMINI_API_KEY,
            baseUrl: 'https://generativelanguage.googleapis.com/v1beta',
            model: 'gemini-2.5-flash-latest',
            enabled: !!process.env.GOOGLE_GEMINI_API_KEY,
            priority: 4,
            isFree: false,
            maxTokens: 8192,
            temperature: 0.7,
            rateLimit: {
                requestsPerMinute: 60,
                requestsPerDay: 50000
            }
        },
        {
            id: 'google-gemini-2.0',
            name: 'Google Gemini 2.0 Pro',
            apiKey: process.env.GOOGLE_GEMINI_API_KEY,
            baseUrl: 'https://generativelanguage.googleapis.com/v1beta',
            model: 'gemini-2.0-pro-latest',
            enabled: !!process.env.GOOGLE_GEMINI_API_KEY,
            priority: 5,
            isFree: false,
            maxTokens: 32768,
            temperature: 0.7,
            rateLimit: {
                requestsPerMinute: 60,
                requestsPerDay: 50000
            }
        },
        {
            id: 'anthropic-claude',
            name: 'Anthropic Claude 3.5 Sonnet',
            apiKey: process.env.ANTHROPIC_API_KEY,
            baseUrl: 'https://api.anthropic.com/v1',
            model: 'claude-3-5-sonnet-20241022',
            enabled: !!process.env.ANTHROPIC_API_KEY,
            priority: 6,
            isFree: false,
            maxTokens: 8192,
            temperature: 0.7,
            rateLimit: {
                requestsPerMinute: 50,
                requestsPerDay: 100000
            }
        },
        {
            id: 'openai-gpt4',
            name: 'OpenAI GPT-4 Turbo',
            apiKey: process.env.OPENAI_API_KEY,
            baseUrl: 'https://api.openai.com/v1',
            model: 'gpt-4-turbo-preview',
            enabled: !!process.env.OPENAI_API_KEY,
            priority: 7,
            isFree: false,
            maxTokens: 4096,
            temperature: 0.7,
            rateLimit: {
                requestsPerMinute: 500,
                requestsPerDay: 200000
            }
        },
        {
            id: 'xai-grok',
            name: 'xAI Grok',
            apiKey: process.env.XAI_API_KEY,
            baseUrl: 'https://api.x.ai/v1',
            model: 'grok-beta',
            enabled: !!process.env.XAI_API_KEY,
            priority: 8,
            isFree: false,
            maxTokens: 8192,
            temperature: 0.7,
            rateLimit: {
                requestsPerMinute: 60,
                requestsPerDay: 10000
            }
        }
    ],
    rotationStrategy: 'priority',
    fallbackEnabled: true,
    timeout: 30000 // 30 seconds
}

// Provider usage tracking
export interface ProviderUsage {
    providerId: string
    requestCount: number
    successCount: number
    failureCount: number
    totalLatency: number
    averageLatency: number
    lastUsed: Date
    dailyRequestCount: number
    minuteRequestCount: number
    lastMinuteReset: Date
    lastDayReset: Date
}

export class LLMProviderManager {
    private config: LLMProviderConfig
    private usage: Map<string, ProviderUsage>
    private currentProviderIndex: number = 0

    constructor(config: LLMProviderConfig = DEFAULT_LLM_CONFIG) {
        this.config = config
        this.usage = new Map()

        // Initialize usage tracking
        config.providers.forEach(provider => {
            this.usage.set(provider.id, {
                providerId: provider.id,
                requestCount: 0,
                successCount: 0,
                failureCount: 0,
                totalLatency: 0,
                averageLatency: 0,
                lastUsed: new Date(),
                dailyRequestCount: 0,
                minuteRequestCount: 0,
                lastMinuteReset: new Date(),
                lastDayReset: new Date()
            })
        })
    }

    /**
     * Get the next available provider based on rotation strategy
     */
    getNextProvider(): LLMProvider | null {
        const enabledProviders = this.config.providers
            .filter(p => p.enabled)
            .sort((a, b) => a.priority - b.priority)

        if (enabledProviders.length === 0) {
            return null
        }

        switch (this.config.rotationStrategy) {
            case 'priority':
                return this.getByPriority(enabledProviders)

            case 'round-robin':
                return this.getRoundRobin(enabledProviders)

            case 'least-used':
                return this.getLeastUsed(enabledProviders)

            case 'fastest':
                return this.getFastest(enabledProviders)

            default:
                return enabledProviders[0]
        }
    }

    private getByPriority(providers: LLMProvider[]): LLMProvider {
        // Check rate limits and return first available
        for (const provider of providers) {
            if (this.checkRateLimit(provider)) {
                return provider
            }
        }
        // If all rate limited, return highest priority
        return providers[0]
    }

    private getRoundRobin(providers: LLMProvider[]): LLMProvider {
        const provider = providers[this.currentProviderIndex % providers.length]
        this.currentProviderIndex++
        return provider
    }

    private getLeastUsed(providers: LLMProvider[]): LLMProvider {
        return providers.reduce((least, current) => {
            const leastUsage = this.usage.get(least.id)!
            const currentUsage = this.usage.get(current.id)!
            return currentUsage.requestCount < leastUsage.requestCount ? current : least
        })
    }

    private getFastest(providers: LLMProvider[]): LLMProvider {
        return providers.reduce((fastest, current) => {
            const fastestUsage = this.usage.get(fastest.id)!
            const currentUsage = this.usage.get(current.id)!
            return currentUsage.averageLatency < fastestUsage.averageLatency ? current : fastest
        })
    }

    /**
     * Check if provider is within rate limits
     */
    private checkRateLimit(provider: LLMProvider): boolean {
        const usage = this.usage.get(provider.id)!
        const now = new Date()

        // Reset counters if needed
        if (now.getTime() - usage.lastMinuteReset.getTime() > 60000) {
            usage.minuteRequestCount = 0
            usage.lastMinuteReset = now
        }

        if (now.getTime() - usage.lastDayReset.getTime() > 86400000) {
            usage.dailyRequestCount = 0
            usage.lastDayReset = now
        }

        // Check limits
        if (usage.minuteRequestCount >= provider.rateLimit.requestsPerMinute) {
            return false
        }

        if (usage.dailyRequestCount >= provider.rateLimit.requestsPerDay) {
            return false
        }

        return true
    }

    /**
     * Record provider usage
     */
    recordUsage(providerId: string, success: boolean, latency: number) {
        const usage = this.usage.get(providerId)
        if (!usage) return

        usage.requestCount++
        usage.minuteRequestCount++
        usage.dailyRequestCount++
        usage.lastUsed = new Date()

        if (success) {
            usage.successCount++
        } else {
            usage.failureCount++
        }

        usage.totalLatency += latency
        usage.averageLatency = usage.totalLatency / usage.requestCount
    }

    /**
     * Get provider statistics
     */
    getProviderStats(providerId: string): ProviderUsage | undefined {
        return this.usage.get(providerId)
    }

    /**
     * Get all provider statistics
     */
    getAllStats(): ProviderUsage[] {
        return Array.from(this.usage.values())
    }

    /**
     * Update provider configuration
     */
    updateProvider(providerId: string, updates: Partial<LLMProvider>) {
        const index = this.config.providers.findIndex(p => p.id === providerId)
        if (index !== -1) {
            this.config.providers[index] = {
                ...this.config.providers[index],
                ...updates
            }
        }
    }

    /**
     * Enable/disable provider
     */
    toggleProvider(providerId: string, enabled: boolean) {
        this.updateProvider(providerId, { enabled })
    }

    /**
     * Get all providers
     */
    getAllProviders(): LLMProvider[] {
        return this.config.providers
    }
}

// Singleton instance
export const llmProviderManager = new LLMProviderManager()
