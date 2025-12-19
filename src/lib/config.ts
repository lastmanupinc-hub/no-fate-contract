/**
 * Configuration Safety - NO FATE CONTRACT
 * 
 * All configuration loaded and validated at boot.
 * Missing or invalid configuration => INVALID_INPUT at startup.
 * NO non-null assertions (process.env.X!) allowed in runtime code.
 */

export interface AppConfig {
  readonly NODE_ENV: 'development' | 'production' | 'test'
  readonly DATABASE_URL: string
  readonly REDIS_URL: string
  readonly STRIPE_SECRET_KEY: string
  readonly STRIPE_WEBHOOK_SECRET: string
  readonly STRIPE_METERED_PRICE_ID: string
  readonly NEXTAUTH_SECRET?: string
  readonly NEXTAUTH_URL?: string
  readonly CLERK_SECRET_KEY?: string
  readonly UPSTASH_REDIS_REST_URL?: string
  readonly UPSTASH_REDIS_REST_TOKEN?: string
  readonly DEFAULT_RATE_LIMIT: number
}

class ConfigurationError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'ConfigurationError'
  }
}

/**
 * Load and validate configuration at boot time
 * Throws ConfigurationError with INVALID_INPUT semantics
 */
function loadConfig(): AppConfig {
  const errors: string[] = []
  
  // Required in all environments
  const required = [
    'DATABASE_URL',
    'REDIS_URL',
  ]
  
  // Required in production
  const requiredInProduction = [
    'STRIPE_SECRET_KEY',
    'STRIPE_WEBHOOK_SECRET',
    'STRIPE_METERED_PRICE_ID',
  ]
  
  const env = process.env.NODE_ENV || 'development'
  const isProduction = env === 'production'
  
  // Check required fields
  for (const key of required) {
    if (!process.env[key] || process.env[key]!.trim() === '') {
      errors.push(`Missing required environment variable: ${key}`)
    }
  }
  
  // Check production requirements
  if (isProduction) {
    for (const key of requiredInProduction) {
      if (!process.env[key] || process.env[key]!.trim() === '') {
        errors.push(`Missing required environment variable in production: ${key}`)
      }
    }
  }
  
  // Fail fast on configuration errors
  if (errors.length > 0) {
    throw new ConfigurationError(
      `Configuration validation failed:\n${errors.join('\n')}`
    )
  }
  
  return {
    NODE_ENV: env as AppConfig['NODE_ENV'],
    DATABASE_URL: process.env.DATABASE_URL!,
    REDIS_URL: process.env.REDIS_URL!,
    STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY || '',
    STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET || '',
    STRIPE_METERED_PRICE_ID: process.env.STRIPE_METERED_PRICE_ID || '',
    NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET,
    NEXTAUTH_URL: process.env.NEXTAUTH_URL,
    CLERK_SECRET_KEY: process.env.CLERK_SECRET_KEY,
    UPSTASH_REDIS_REST_URL: process.env.UPSTASH_REDIS_REST_URL,
    UPSTASH_REDIS_REST_TOKEN: process.env.UPSTASH_REDIS_REST_TOKEN,
    DEFAULT_RATE_LIMIT: parseInt(process.env.DEFAULT_RATE_LIMIT || '100', 10),
  }
}

// Singleton config - loaded once at module initialization
let _config: AppConfig | null = null

export function getConfig(): AppConfig {
  if (!_config) {
    _config = loadConfig()
  }
  return _config
}

// Validate config at module load (fail fast at boot)
try {
  getConfig()
} catch (error) {
  if (error instanceof ConfigurationError) {
    console.error('[FATAL] Configuration validation failed (INVALID_INPUT):')
    console.error(error.message)
    process.exit(1)
  }
  throw error
}
