import { shallowRef } from 'vue'
import { isDemo } from './config'
import type { Session } from './contracts'

const key = isDemo ? 'grace-church.session.mock' : 'grace-church.session.api'
const stored = uni.getStorageSync(key) as Session | undefined
const sessionState = shallowRef<Session | null>(stored?.token ? stored : null)
export const session = sessionState as Readonly<typeof sessionState>
let expiryTimer: ReturnType<typeof setTimeout> | undefined

export function setSession(value: Session | null) {
  if (value) uni.setStorageSync(key, value)
  else uni.removeStorageSync(key)
  sessionState.value = value
  scheduleExpiry()
}

export function currentSession() {
  const value = sessionState.value
  if (value && !(Date.parse(value.expiresAt) > Date.now())) {
    setSession(null)
    return null
  }
  return value
}

function scheduleExpiry() {
  clearTimeout(expiryTimer)
  const value = currentSession()
  if (!value) return
  const delay = Date.parse(value.expiresAt) - Date.now()
  expiryTimer = setTimeout(scheduleExpiry, Math.min(2_000_000_000, Math.max(delay, 1)))
}

scheduleExpiry()
