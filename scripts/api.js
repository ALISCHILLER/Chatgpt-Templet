/* ==================== OPENAI API CLIENT ==================== */

class OpenAIAPI {
    constructor() {
        this.baseURL = 'https://api.openai.com/v1';
        this.config = {
            apiKey: '',
            model: 'gpt-4o',
            temperature: 0.7,
            maxTokens: 2048
        };
        this.rateLimitInfo = {
            requests: 0,
            tokens: 0,
            resetTime: null
        };
    }

    /* ==================== CONFIGURATION ==================== */

    updateConfig(newConfig) {
        this.config = { ...this.config, ...newConfig };
    }

    getHeaders() {
        return {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.config.apiKey}`,
            'User-Agent': 'ChatGPT-Persian/1.0'
        };
    }

    /* ==================== API KEY VALIDATION ==================== */

    async validateApiKey(apiKey = this.config.apiKey) {
        if (!apiKey) {
            throw new APIError('API key is required', 'MISSING_API_KEY');
        }

        try {
            const response = await fetch(`${this.baseURL}/models`, {
                headers: {
                    'Authorization': `Bearer ${apiKey}`,
                    'Content-Type': 'application/json'
                }
            });

            return response.ok;
        } catch (error) {
            console.error('API key validation error:', error);
            return false;
        }
    }

    /* ==================== MODELS API ==================== */

    async getModels() {
        try {
            const response = await this.makeRequest('/models', {
                method: 'GET'
            });

            if (response.ok) {
                const data = await response.json();
                return data.data;
            } else {
                throw new APIError('Failed to fetch models', 'MODELS_FETCH_ERROR');
            }
        } catch (error) {
            console.error('Error fetching models:', error);
            throw error;
        }
    }

    /* ==================== CHAT COMPLETIONS ==================== */

    async createChatCompletion(messages, options = {}) {
        const requestBody = {
            model: options.model || this.config.model,
            messages: messages,
            temperature: options.temperature ?? this.config.temperature,
            max_tokens: options.max_tokens || this.config.maxTokens,
            top_p: options.top_p ?? this.config.topP,
            frequency_penalty: options.frequency_penalty ?? this.config.frequencyPenalty,
            presence_penalty: options.presence_penalty ?? this.config.presencePenalty,
            stream: false
        };

        try {
            const response = await this.makeRequest('/chat/completions', {
                method: 'POST',
                body: JSON.stringify(requestBody)
            });

            if (response.ok) {
                const data = await response.json();
                this.updateRateLimitInfo(response.headers);
                return data;
            } else {
                const errorData = await response.json().catch(() => null);
                throw new APIError(
                    errorData?.error?.message || `HTTP ${response.status}: ${response.statusText}`,
                    errorData?.error?.code || 'API_ERROR',
                    response.status
                );
            }
        } catch (error) {
            if (error instanceof APIError) throw error;
            throw new APIError('Network error occurred', 'NETWORK_ERROR');
        }
    }

    async createChatCompletionStream(messages, options = {}, signal) {
        const requestBody = {
            model: options.model || this.config.model,
            messages: messages,
            temperature: options.temperature ?? this.config.temperature,
            max_tokens: options.max_tokens || this.config.maxTokens,
            top_p: options.top_p ?? this.config.topP,
            frequency_penalty: options.frequency_penalty ?? this.config.frequencyPenalty,
            presence_penalty: options.presence_penalty ?? this.config.presencePenalty,
            stream: true
        };

        try {
            const response = await this.makeRequest('/chat/completions', {
                method: 'POST',
                body: JSON.stringify(requestBody),
                signal: signal
            });

            if (response.ok) {
                this.updateRateLimitInfo(response.headers);
                return this.parseStreamResponse(response);
            } else {
                const errorData = await response.json().catch(() => null);
                throw new APIError(
                    errorData?.error?.message || `HTTP ${response.status}: ${response.statusText}`,
                    errorData?.error?.code || 'API_ERROR',
                    response.status
                );
            }
        } catch (error) {
            if (error instanceof APIError) throw error;
            if (error.name === 'AbortError') throw error;
            throw new APIError('Network error occurred', 'NETWORK_ERROR');
        }
    }

    async *parseStreamResponse(response) {
        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let buffer = '';

        try {
            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                buffer += decoder.decode(value, { stream: true });
                const lines = buffer.split('
');
                buffer = lines.pop(); // Keep the incomplete line in buffer

                for (const line of lines) {
                    const trimmedLine = line.trim();
                    if (!trimmedLine || trimmedLine === 'data: [DONE]') continue;

                    if (trimmedLine.startsWith('data: ')) {
                        try {
                            const jsonData = trimmedLine.slice(6);
                            const data = JSON.parse(jsonData);
                            yield data;
                        } catch (error) {
                            console.warn('Failed to parse SSE data:', error, trimmedLine);
                        }
                    }
                }
            }
        } finally {
            reader.releaseLock();
        }
    }

    /* ==================== EMBEDDINGS API ==================== */

    async createEmbedding(input, model = 'text-embedding-ada-002') {
        const requestBody = {
            model: model,
            input: input
        };

        try {
            const response = await this.makeRequest('/embeddings', {
                method: 'POST',
                body: JSON.stringify(requestBody)
            });

            if (response.ok) {
                const data = await response.json();
                this.updateRateLimitInfo(response.headers);
                return data;
            } else {
                const errorData = await response.json().catch(() => null);
                throw new APIError(
                    errorData?.error?.message || `HTTP ${response.status}: ${response.statusText}`,
                    errorData?.error?.code || 'API_ERROR',
                    response.status
                );
            }
        } catch (error) {
            if (error instanceof APIError) throw error;
            throw new APIError('Network error occurred', 'NETWORK_ERROR');
        }
    }

    /* ==================== AUDIO API ==================== */

    async transcribeAudio(audioFile, options = {}) {
        const formData = new FormData();
        formData.append('file', audioFile);
        formData.append('model', options.model || 'whisper-1');
        
        if (options.language) formData.append('language', options.language);
        if (options.prompt) formData.append('prompt', options.prompt);
        if (options.temperature) formData.append('temperature', options.temperature);

        try {
            const response = await this.makeRequest('/audio/transcriptions', {
                method: 'POST',
                body: formData,
                headers: {
                    'Authorization': `Bearer ${this.config.apiKey}`
                }
            });

            if (response.ok) {
                const data = await response.json();
                this.updateRateLimitInfo(response.headers);
                return data;
            } else {
                const errorData = await response.json().catch(() => null);
                throw new APIError(
                    errorData?.error?.message || `HTTP ${response.status}: ${response.statusText}`,
                    errorData?.error?.code || 'API_ERROR',
                    response.status
                );
            }
        } catch (error) {
            if (error instanceof APIError) throw error;
            throw new APIError('Network error occurred', 'NETWORK_ERROR');
        }
    }

    async generateSpeech(text, options = {}) {
        const requestBody = {
            model: options.model || 'tts-1',
            input: text,
            voice: options.voice || 'alloy',
            response_format: options.format || 'mp3',
            speed: options.speed || 1.0
        };

        try {
            const response = await this.makeRequest('/audio/speech', {
                method: 'POST',
                body: JSON.stringify(requestBody)
            });

            if (response.ok) {
                this.updateRateLimitInfo(response.headers);
                return await response.blob();
            } else {
                const errorData = await response.json().catch(() => null);
                throw new APIError(
                    errorData?.error?.message || `HTTP ${response.status}: ${response.statusText}`,
                    errorData?.error?.code || 'API_ERROR',
                    response.status
                );
            }
        } catch (error) {
            if (error instanceof APIError) throw error;
            throw new APIError('Network error occurred', 'NETWORK_ERROR');
        }
    }

    /* ==================== VISION API ==================== */

    async analyzeImage(imageUrl, prompt, options = {}) {
        const messages = [
            {
                role: 'user',
                content: [
                    {
                        type: 'text',
                        text: prompt
                    },
                    {
                        type: 'image_url',
                        image_url: {
                            url: imageUrl,
                            detail: options.detail || 'auto'
                        }
                    }
                ]
            }
        ];

        return this.createChatCompletion(messages, {
            model: options.model || 'gpt-4-vision-preview',
            max_tokens: options.max_tokens || 300
        });
    }

    /* ==================== MODERATION API ==================== */

    async moderateContent(input) {
        const requestBody = {
            input: input
        };

        try {
            const response = await this.makeRequest('/moderations', {
                method: 'POST',
                body: JSON.stringify(requestBody)
            });

            if (response.ok) {
                const data = await response.json();
                this.updateRateLimitInfo(response.headers);
                return data;
            } else {
                const errorData = await response.json().catch(() => null);
                throw new APIError(
                    errorData?.error?.message || `HTTP ${response.status}: ${response.statusText}`,
                    errorData?.error?.code || 'API_ERROR',
                    response.status
                );
            }
        } catch (error) {
            if (error instanceof APIError) throw error;
            throw new APIError('Network error occurred', 'NETWORK_ERROR');
        }
    }

    /* ==================== UTILITY METHODS ==================== */

    async makeRequest(endpoint, options = {}) {
        const url = `${this.baseURL}${endpoint}`;
        const headers = {
            ...this.getHeaders(),
            ...options.headers
        };

        // Remove Content-Type for FormData
        if (options.body instanceof FormData) {
            delete headers['Content-Type'];
        }

        const requestOptions = {
            ...options,
            headers
        };

        // Add retry logic with exponential backoff
        return this.withRetry(() => fetch(url, requestOptions), 3);
    }

    async withRetry(fn, maxRetries = 3, baseDelay = 1000) {
        let lastError;
        
        for (let attempt = 0; attempt <= maxRetries; attempt++) {
            try {
                const result = await fn();
                
                // If rate limited, wait and retry
                if (result.status === 429) {
                    const retryAfter = result.headers.get('Retry-After');
                    const delay = retryAfter ? parseInt(retryAfter) * 1000 : baseDelay * Math.pow(2, attempt);
                    
                    if (attempt < maxRetries) {
                        console.warn(`Rate limited, retrying after ${delay}ms...`);
                        await new Promise(resolve => setTimeout(resolve, delay));
                        continue;
                    }
                }
                
                return result;
            } catch (error) {
                lastError = error;
                
                if (attempt < maxRetries && this.isRetryableError(error)) {
                    const delay = baseDelay * Math.pow(2, attempt);
                    console.warn(`Request failed, retrying after ${delay}ms...`, error.message);
                    await new Promise(resolve => setTimeout(resolve, delay));
                    continue;
                }
                
                break;
            }
        }
        
        throw lastError;
    }

    isRetryableError(error) {
        return error.name === 'TypeError' || // Network errors
               (error.status >= 500 && error.status < 600) || // Server errors
               error.status === 429; // Rate limit
    }

    updateRateLimitInfo(headers) {
        this.rateLimitInfo = {
            requests: parseInt(headers.get('x-ratelimit-remaining-requests')) || 0,
            tokens: parseInt(headers.get('x-ratelimit-remaining-tokens')) || 0,
            resetTime: headers.get('x-ratelimit-reset-requests') || null
        };
    }

    getRateLimitInfo() {
        return { ...this.rateLimitInfo };
    }

    /* ==================== TOKEN AND COST ESTIMATION ==================== */

    estimateTokens(text, model = this.config.model) {
        // Rough estimation based on OpenAI's guidelines
        // 1 token ≈ 4 characters for English, may vary for Persian
        const baseTokens = Math.ceil(text.length / 3); // More conservative for Persian
        
        // Add some overhead for system messages and formatting
        return Math.ceil(baseTokens * 1.1);
    }

    calculateCost(inputTokens, outputTokens, model = this.config.model) {
        // Pricing as of 2024 (per 1K tokens)
        const pricing = {
            'gpt-4o': { input: 0.005, output: 0.015 },
            'gpt-4o-mini': { input: 0.00015, output: 0.0006 },
            'gpt-4-turbo': { input: 0.01, output: 0.03 },
            'gpt-4': { input: 0.03, output: 0.06 },
            'gpt-3.5-turbo': { input: 0.0015, output: 0.002 },
            'o1-preview': { input: 0.015, output: 0.06 },
            'o1-mini': { input: 0.003, output: 0.012 }
        };

        const modelPricing = pricing[model] || pricing['gpt-3.5-turbo'];
        
        const inputCost = (inputTokens / 1000) * modelPricing.input;
        const outputCost = (outputTokens / 1000) * modelPricing.output;
        
        return {
            input: inputCost,
            output: outputCost,
            total: inputCost + outputCost
        };
    }

    /* ==================== HEALTH CHECK ==================== */

    async healthCheck() {
        try {
            const response = await fetch(`${this.baseURL}/models`, {
                headers: {
                    'Authorization': `Bearer ${this.config.apiKey}`
                },
                signal: AbortSignal.timeout(5000) // 5 second timeout
            });

            return {
                status: response.ok ? 'healthy' : 'unhealthy',
                statusCode: response.status,
                rateLimitInfo: this.getRateLimitInfo()
            };
        } catch (error) {
            return {
                status: 'error',
                error: error.message,
                rateLimitInfo: this.getRateLimitInfo()
            };
        }
    }
}

/* ==================== API ERROR CLASS ==================== */

class APIError extends Error {
    constructor(message, code, statusCode) {
        super(message);
        this.name = 'APIError';
        this.code = code;
        this.statusCode = statusCode;
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { OpenAIAPI, APIError };
}
