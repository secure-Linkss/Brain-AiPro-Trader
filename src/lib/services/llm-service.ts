/**
 * LLM Service - Unified interface for all AI providers
 * Handles automatic rotation, fallback, and error recovery
 */

import { llmProviderManager, LLMProvider } from '@/lib/config/llm-providers'

export interface LLMRequest {
    prompt: string
    systemPrompt?: string
    maxTokens?: number
    temperature?: number
    stopSequences?: string[]
    stream?: boolean
}

export interface LLMResponse {
    content: string
    provider: string
    model: string
    tokensUsed: number
    latency: number
    cached: boolean
}

export interface LLMError {
    provider: string
    error: string
    code?: string
    retryable: boolean
}

class LLMService {
    private cache: Map<string, { response: LLMResponse; timestamp: number }>
    private readonly CACHE_TTL = 3600000 // 1 hour

    constructor() {
        this.cache = new Map()
    }

    /**
     * Generate completion with automatic provider rotation and fallback
     */
    async generateCompletion(request: LLMRequest): Promise<LLMResponse> {
        const cacheKey = this.getCacheKey(request)

        // Check cache first
        const cached = this.getFromCache(cacheKey)
        if (cached) {
            return { ...cached, cached: true }
        }

        const errors: LLMError[] = []
        const maxRetries = 3

        for (let attempt = 0; attempt < maxRetries; attempt++) {
            const provider = llmProviderManager.getNextProvider()

            if (!provider) {
                throw new Error('No LLM providers available')
            }

            try {
                const startTime = Date.now()
                const response = await this.callProvider(provider, request)
                const latency = Date.now() - startTime

                // Record success
                llmProviderManager.recordUsage(provider.id, true, latency)

                const llmResponse: LLMResponse = {
                    content: response.content,
                    provider: provider.name,
                    model: provider.model,
                    tokensUsed: response.tokensUsed,
                    latency,
                    cached: false
                }

                // Cache the response
                this.setCache(cacheKey, llmResponse)

                return llmResponse

            } catch (error: any) {
                const latency = Date.now() - Date.now()
                llmProviderManager.recordUsage(provider.id, false, latency)

                const llmError: LLMError = {
                    provider: provider.name,
                    error: error.message,
                    code: error.code,
                    retryable: this.isRetryable(error)
                }

                errors.push(llmError)

                console.error(`LLM Provider ${provider.name} failed:`, error)

                // If not retryable, try next provider immediately
                if (!llmError.retryable) {
                    continue
                }

                // Wait before retry
                if (attempt < maxRetries - 1) {
                    await this.sleep(1000 * (attempt + 1))
                }
            }
        }

        // All providers failed
        throw new Error(`All LLM providers failed: ${JSON.stringify(errors)}`)
    }

    /**
     * Call specific provider
     */
    private async callProvider(
        provider: LLMProvider,
        request: LLMRequest
    ): Promise<{ content: string; tokensUsed: number }> {

        switch (provider.id) {
            case 'groq':
                return this.callGroq(provider, request)

            case 'huggingface':
                return this.callHuggingFace(provider, request)

            case 'together':
                return this.callTogether(provider, request)

            case 'google-gemini-flash-2.5':
            case 'google-gemini-2.0':
                return this.callGemini(provider, request)

            case 'anthropic-claude':
                return this.callClaude(provider, request)

            case 'openai-gpt4':
                return this.callOpenAI(provider, request)

            case 'xai-grok':
                return this.callGrok(provider, request)

            default:
                throw new Error(`Unknown provider: ${provider.id}`)
        }
    }

    /**
     * Groq API (Free)
     */
    private async callGroq(
        provider: LLMProvider,
        request: LLMRequest
    ): Promise<{ content: string; tokensUsed: number }> {
        const response = await fetch(`${provider.baseUrl}/chat/completions`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${provider.apiKey || process.env.GROQ_API_KEY || 'gsk_free'}`
            },
            body: JSON.stringify({
                model: provider.model,
                messages: [
                    ...(request.systemPrompt ? [{ role: 'system', content: request.systemPrompt }] : []),
                    { role: 'user', content: request.prompt }
                ],
                max_tokens: request.maxTokens || provider.maxTokens,
                temperature: request.temperature || provider.temperature,
                stop: request.stopSequences
            })
        })

        if (!response.ok) {
            throw new Error(`Groq API error: ${response.statusText}`)
        }

        const data = await response.json()
        return {
            content: data.choices[0].message.content,
            tokensUsed: data.usage?.total_tokens || 0
        }
    }

    /**
     * HuggingFace Inference API (Free)
     */
    private async callHuggingFace(
        provider: LLMProvider,
        request: LLMRequest
    ): Promise<{ content: string; tokensUsed: number }> {
        const response = await fetch(`${provider.baseUrl}/${provider.model}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${provider.apiKey || process.env.HUGGINGFACE_API_KEY || ''}`
            },
            body: JSON.stringify({
                inputs: request.prompt,
                parameters: {
                    max_new_tokens: request.maxTokens || provider.maxTokens,
                    temperature: request.temperature || provider.temperature,
                    return_full_text: false
                }
            })
        })

        if (!response.ok) {
            throw new Error(`HuggingFace API error: ${response.statusText}`)
        }

        const data = await response.json()
        const content = Array.isArray(data) ? data[0].generated_text : data.generated_text

        return {
            content,
            tokensUsed: content.split(' ').length // Approximate
        }
    }

    /**
     * Together AI (Free Tier)
     */
    private async callTogether(
        provider: LLMProvider,
        request: LLMRequest
    ): Promise<{ content: string; tokensUsed: number }> {
        const response = await fetch(`${provider.baseUrl}/chat/completions`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${provider.apiKey || process.env.TOGETHER_API_KEY || ''}`
            },
            body: JSON.stringify({
                model: provider.model,
                messages: [
                    ...(request.systemPrompt ? [{ role: 'system', content: request.systemPrompt }] : []),
                    { role: 'user', content: request.prompt }
                ],
                max_tokens: request.maxTokens || provider.maxTokens,
                temperature: request.temperature || provider.temperature
            })
        })

        if (!response.ok) {
            throw new Error(`Together AI error: ${response.statusText}`)
        }

        const data = await response.json()
        return {
            content: data.choices[0].message.content,
            tokensUsed: data.usage?.total_tokens || 0
        }
    }

    /**
     * Google Gemini API
     */
    private async callGemini(
        provider: LLMProvider,
        request: LLMRequest
    ): Promise<{ content: string; tokensUsed: number }> {
        const apiKey = provider.apiKey || process.env.GOOGLE_GEMINI_API_KEY
        if (!apiKey) {
            throw new Error('Google Gemini API key not configured')
        }

        const response = await fetch(
            `${provider.baseUrl}/models/${provider.model}:generateContent?key=${apiKey}`,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    contents: [{
                        parts: [{
                            text: request.systemPrompt
                                ? `${request.systemPrompt}\n\n${request.prompt}`
                                : request.prompt
                        }]
                    }],
                    generationConfig: {
                        maxOutputTokens: request.maxTokens || provider.maxTokens,
                        temperature: request.temperature || provider.temperature
                    }
                })
            }
        )

        if (!response.ok) {
            throw new Error(`Gemini API error: ${response.statusText}`)
        }

        const data = await response.json()
        return {
            content: data.candidates[0].content.parts[0].text,
            tokensUsed: data.usageMetadata?.totalTokenCount || 0
        }
    }

    /**
     * Anthropic Claude API
     */
    private async callClaude(
        provider: LLMProvider,
        request: LLMRequest
    ): Promise<{ content: string; tokensUsed: number }> {
        const apiKey = provider.apiKey || process.env.ANTHROPIC_API_KEY
        if (!apiKey) {
            throw new Error('Anthropic API key not configured')
        }

        const response = await fetch(`${provider.baseUrl}/messages`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': apiKey,
                'anthropic-version': '2023-06-01'
            },
            body: JSON.stringify({
                model: provider.model,
                max_tokens: request.maxTokens || provider.maxTokens,
                temperature: request.temperature || provider.temperature,
                system: request.systemPrompt,
                messages: [{
                    role: 'user',
                    content: request.prompt
                }]
            })
        })

        if (!response.ok) {
            throw new Error(`Claude API error: ${response.statusText}`)
        }

        const data = await response.json()
        return {
            content: data.content[0].text,
            tokensUsed: data.usage?.total_tokens || 0
        }
    }

    /**
     * OpenAI GPT-4 API
     */
    private async callOpenAI(
        provider: LLMProvider,
        request: LLMRequest
    ): Promise<{ content: string; tokensUsed: number }> {
        const apiKey = provider.apiKey || process.env.OPENAI_API_KEY
        if (!apiKey) {
            throw new Error('OpenAI API key not configured')
        }

        const response = await fetch(`${provider.baseUrl}/chat/completions`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                model: provider.model,
                messages: [
                    ...(request.systemPrompt ? [{ role: 'system', content: request.systemPrompt }] : []),
                    { role: 'user', content: request.prompt }
                ],
                max_tokens: request.maxTokens || provider.maxTokens,
                temperature: request.temperature || provider.temperature
            })
        })

        if (!response.ok) {
            throw new Error(`OpenAI API error: ${response.statusText}`)
        }

        const data = await response.json()
        return {
            content: data.choices[0].message.content,
            tokensUsed: data.usage?.total_tokens || 0
        }
    }

    /**
     * xAI Grok API
     */
    private async callGrok(
        provider: LLMProvider,
        request: LLMRequest
    ): Promise<{ content: string; tokensUsed: number }> {
        const apiKey = provider.apiKey || process.env.XAI_API_KEY
        if (!apiKey) {
            throw new Error('xAI API key not configured')
        }

        const response = await fetch(`${provider.baseUrl}/chat/completions`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                model: provider.model,
                messages: [
                    ...(request.systemPrompt ? [{ role: 'system', content: request.systemPrompt }] : []),
                    { role: 'user', content: request.prompt }
                ],
                max_tokens: request.maxTokens || provider.maxTokens,
                temperature: request.temperature || provider.temperature
            })
        })

        if (!response.ok) {
            throw new Error(`Grok API error: ${response.statusText}`)
        }

        const data = await response.json()
        return {
            content: data.choices[0].message.content,
            tokensUsed: data.usage?.total_tokens || 0
        }
    }

    /**
     * Check if error is retryable
     */
    private isRetryable(error: any): boolean {
        const retryableCodes = ['ECONNRESET', 'ETIMEDOUT', 'ENOTFOUND', 'rate_limit_exceeded']
        return retryableCodes.some(code =>
            error.code === code || error.message?.includes(code)
        )
    }

    /**
     * Cache management
     */
    private getCacheKey(request: LLMRequest): string {
        return `${request.systemPrompt || ''}_${request.prompt}_${request.maxTokens}_${request.temperature}`
    }

    private getFromCache(key: string): LLMResponse | null {
        const cached = this.cache.get(key)
        if (!cached) return null

        const age = Date.now() - cached.timestamp
        if (age > this.CACHE_TTL) {
            this.cache.delete(key)
            return null
        }

        return cached.response
    }

    private setCache(key: string, response: LLMResponse) {
        this.cache.set(key, {
            response,
            timestamp: Date.now()
        })
    }

    private sleep(ms: number): Promise<void> {
        return new Promise(resolve => setTimeout(resolve, ms))
    }

    /**
     * Get provider statistics
     */
    getProviderStats() {
        return llmProviderManager.getAllStats()
    }

    /**
     * Clear cache
     */
    clearCache() {
        this.cache.clear()
    }
}

// Singleton instance
export const llmService = new LLMService()
