/**
 * Application environment and config.
 * Extend with validated env vars as needed.
 */
export const env = {
  isDev: process.env.NODE_ENV === 'development',
  isProd: process.env.NODE_ENV === 'production',
} as const
