export const isDemo = import.meta.env.DEV && import.meta.env.VITE_DATA_MODE === 'mock'
export const apiBaseUrl = String(import.meta.env.VITE_API_BASE_URL ?? '').trim().replace(/\/+$/, '')
