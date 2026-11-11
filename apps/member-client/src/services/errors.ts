import { t, type MessageKey } from '../i18n'

const messages = {
  AUTH_REQUIRED: 'signInRequired',
  SESSION_EXPIRED: 'sessionExpired',
  FORBIDDEN: 'forbidden',
  MEMBER_REQUIRED: 'unlinked',
  NOT_FOUND: 'missing',
  NETWORK_ERROR: 'network',
  CONFIG_ERROR: 'configError',
  CHECKIN_WINDOW_CLOSED: 'windowClosed',
  CHECKIN_WINDOW_NOT_OPEN: 'windowUpcoming',
  GUEST_NAME_REQUIRED: 'guestNameRequired',
  GUEST_CONTACT_INVALID: 'guestContactInvalid',
  GUEST_PASS_REQUIRED: 'guestPassRequired',
  UNKNOWN: 'unknown',
} as const satisfies Record<string, MessageKey>

export type ErrorCode = keyof typeof messages

export class ServiceError extends Error {
  constructor(readonly code: ErrorCode) {
    super(code)
    this.name = 'ServiceError'
  }
}

export const codeOf = (error: unknown): ErrorCode =>
  error instanceof ServiceError ? error.code : 'UNKNOWN'

export const errorMessage = (code: ErrorCode) => t(messages[code])

export function httpError(status: number, body: unknown): ServiceError {
  const code = (body as { code?: unknown } | null)?.code
  if (typeof code === 'string' && Object.hasOwn(messages, code)) {
    return new ServiceError(code as ErrorCode)
  }
  if (status === 401) return new ServiceError('AUTH_REQUIRED')
  if (status === 403) return new ServiceError('FORBIDDEN')
  if (status === 404) return new ServiceError('NOT_FOUND')
  return new ServiceError('UNKNOWN')
}
