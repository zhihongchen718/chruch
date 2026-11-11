import { onHide, onShow, onUnload } from '@dcloudio/uni-app'
import { watch } from 'vue'
import { locale, t, type MessageKey } from '../i18n'
import { currentSession } from './session'

const tabs = ['home', 'members', 'groups', 'resources', 'more'] as const
type Tab = typeof tabs[number]
let pendingCheckIn: string | null = null

export function usePageTitle(title: MessageKey, tab = false) {
  let active = false
  const update = () => {
    uni.setNavigationBarTitle({ title: t(title) })
    if (tab) tabs.forEach((key, index) => uni.setTabBarItem({ index, text: t(key) }))
  }
  onShow(() => {
    active = true
    currentSession()
    update()
  })
  const deactivate = () => { active = false }
  onHide(deactivate)
  onUnload(deactivate)
  watch(locale, () => { if (active) update() })
}

export const goTab = (tab: Tab) => uni.switchTab({ url: `/pages/${tab}/index` })
export const openPage = (path: string) => uni.navigateTo({ url: `/pages/${path}` })
export const eventRoute = (id: string) => `events/detail?id=${encodeURIComponent(id)}`
export const authRoute = (id?: string) => id ? `auth/index?eventSessionId=${encodeURIComponent(id)}` : 'auth/index'
export const guestRoute = (id: string, pass = '') => `events/guest-checkin?id=${encodeURIComponent(id)}${pass ? `&pass=${encodeURIComponent(pass)}` : ''}`

export function showComingSoon(feature: MessageKey) {
  uni.showModal({ title: t(feature), content: t('featureUnavailable'), showCancel: false })
}

export function memberCheckInFromHome(id: string, signedIn: boolean) {
  if (signedIn) {
    pendingCheckIn = id
    openPage(eventRoute(id))
  } else {
    openPage(authRoute(id))
  }
}

export function resumeAfterSignIn(id?: string) {
  const previous = getCurrentPages().at(-2)
  if (id) {
    pendingCheckIn = id
    if (previous?.route === 'pages/events/detail') uni.navigateBack()
    else uni.redirectTo({ url: `/pages/${eventRoute(id)}` })
  } else if (previous) {
    uni.navigateBack()
  } else {
    goTab('members')
  }
}

export function takeCheckInIntent(id: string) {
  if (pendingCheckIn !== id) return false
  pendingCheckIn = null
  return true
}
