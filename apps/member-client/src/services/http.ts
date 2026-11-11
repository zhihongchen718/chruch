import { apiBaseUrl } from './config'
import type { ChurchService } from './contracts'
import { httpError, ServiceError } from './errors'
import { currentSession, setSession } from './session'

function request<T>(path: string, data?: object, authRequired = false): Promise<T> {
  if (!/^https?:\/\/[^/]+/i.test(apiBaseUrl) || (import.meta.env.PROD && !apiBaseUrl.startsWith('https://'))) {
    return Promise.reject(new ServiceError('CONFIG_ERROR'))
  }
  const session = currentSession()
  if (authRequired && !session) return Promise.reject(new ServiceError('AUTH_REQUIRED'))

  return new Promise((resolve, reject) => {
    uni.request({
      url: `${apiBaseUrl}/api/v1${path}`,
      method: data ? 'POST' : 'GET',
      data,
      timeout: 10_000,
      header: session ? { Authorization: `Bearer ${session.token}` } : {},
      success(response) {
        if (response.statusCode >= 200 && response.statusCode < 300) {
          resolve(response.data as T)
          return
        }
        if (response.statusCode === 401 && session && session === currentSession()) {
          setSession(null)
          reject(new ServiceError('SESSION_EXPIRED'))
          return
        }
        reject(httpError(response.statusCode, response.data))
      },
      fail() { reject(new ServiceError('NETWORK_ERROR')) },
    })
  })
}

const eventPath = (id: string) => `/event-sessions/${encodeURIComponent(id)}`
const resourcePath = (id: string) => `/resources/${encodeURIComponent(id)}`

export const httpService: ChurchService = {
  getHome: () => request('/home'),
  async signIn() {
    if (!apiBaseUrl) throw new ServiceError('CONFIG_ERROR')
    const code = await new Promise<string>((resolve, reject) => {
      uni.login({
        provider: 'weixin',
        success(result) {
          if (result.code) resolve(result.code)
          else reject(new ServiceError('AUTH_REQUIRED'))
        },
        fail() { reject(new ServiceError('AUTH_REQUIRED')) },
      })
    })
    return request('/auth/wechat', { code })
  },
  getMe: () => request('/me', undefined, true),
  getEvent: id => request(eventPath(id)),
  checkIn: id => request(`${eventPath(id)}/checkins`, {}, true),
  guestCheckIn: (id, registration) => {
    if (!registration.eventPass) return Promise.reject(new ServiceError('GUEST_PASS_REQUIRED'))
    return request(`${eventPath(id)}/guest-checkins`, registration)
  },
  getGroups: () => request('/groups'),
  getNotices: () => request('/notices'),
  getNotice: id => request(`/notices/${encodeURIComponent(id)}`),
  getResources: () => request('/resources'),
  getResource: id => request(resourcePath(id)),
  getPlayback: id => request(`${resourcePath(id)}/playback`, {}),
}
