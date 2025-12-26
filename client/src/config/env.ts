interface ImportMetaEnv {
  readonly VITE_URL: string
  // Add other env variables here as you need them
  // readonly VITE_API_KEY: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

// Validate required env variables at startup
const requiredEnvVars = ['VITE_URL'] as const

for (const key of requiredEnvVars) {
  if (!import.meta.env[key]) {
    throw new Error(`Missing required environment variable: ${key}`)
  }
}

export const env = {
  url: import.meta.env.VITE_URL,
  // Add more as needed
} as const
