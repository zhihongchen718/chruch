import type { EventSession, GuestRegistration } from './contracts'
import { ServiceError } from './errors'

export function checkInWindow(event: EventSession, now = Date.now()) {
  if (now < Date.parse(event.opensAt)) return 'upcoming'
  return now < Date.parse(event.closesAt) ? 'open' : 'closed'
}

export function assertWindow(event: EventSession) {
  const window = checkInWindow(event)
  if (window === 'upcoming') throw new ServiceError('CHECKIN_WINDOW_NOT_OPEN')
  if (window === 'closed') throw new ServiceError('CHECKIN_WINDOW_CLOSED')
}

export function validateGuest(name: string, contact: string): 'GUEST_NAME_REQUIRED' | 'GUEST_CONTACT_INVALID' | null {
  if (!name.trim() || name.trim().length > 60) return 'GUEST_NAME_REQUIRED'
  const value = contact.trim()
  const email = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
  const phone = /^\+?[\d\s().-]+$/.test(value) && /^\d{7,15}$/.test(value.replace(/\D/g, ''))
  return value.length <= 120 && (email || phone) ? null : 'GUEST_CONTACT_INVALID'
}

export function assertGuest(value: GuestRegistration) {
  const error = validateGuest(value.name, value.contact)
  if (error) throw new ServiceError(error)
}
