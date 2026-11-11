import { addDays, dateInZone, instantInZone } from '../services/time'
import { assertGuest, assertWindow } from '../services/checkin'
import { ServiceError } from '../services/errors'
import type { CheckIn, CheckInResult, ChurchService, EventSession, Session } from '../services/contracts'
import { church, groups, makeNotices, member, resources } from './fixtures'

const checkInsKey = 'grace-church.demo.checkins.v1'
type Ledger = Record<string, CheckIn>

export function createMockService(currentSession: () => Session | null): ChurchService {
  const churchDate = () => dateInZone(Date.now(), church.timezone)
  const ledger = (): Ledger => uni.getStorageSync(checkInsKey) || {}
  const memberId = () => currentSession()?.memberId === member.id ? member.id : null
  const visible = (item: { visibility: 'public' | 'members' }) =>
    item.visibility === 'public' || Boolean(memberId())
  const findVisible = <T extends { id: string; visibility: 'public' | 'members' }>(items: T[], id: string) => {
    const item = items.find(candidate => candidate.id === id)
    if (!item) throw new ServiceError('NOT_FOUND')
    if (!visible(item)) throw new ServiceError('FORBIDDEN')
    return item
  }

  function sessionFor(date: string): EventSession {
    const id = `worship-${date}-1000`
    const records = ledger()
    const memberCheckIn = memberId() ? records[`${id}:member:${member.id}`] ?? null : null
    const guestCheckIn = records[`${id}:guest:device`] ?? null
    return {
      id,
      title: ['主日崇拜签到', 'Sunday Worship'],
      description: ['欢迎一起敬拜、祷告和聆听信息。演示场次每天更新。', 'Join us for worship, prayer, and a message. The demo session refreshes daily.'],
      venue: ['主礼堂', 'Main Sanctuary'],
      timezone: church.timezone,
      startsAt: instantInZone(date, '10:00', church.timezone),
      endsAt: instantInZone(date, '11:30', church.timezone),
      opensAt: instantInZone(date, '00:00', church.timezone),
      closesAt: instantInZone(addDays(date, 1), '00:00', church.timezone),
      attendance: {
        members: 86 + Number(Boolean(records[`${id}:member:${member.id}`])),
        guests: 7 + Number(Boolean(guestCheckIn)),
      },
      memberCheckIn,
      guestCheckIn,
    }
  }

  function getEvent(id: string) {
    const match = /^worship-(\d{4}-\d{2}-\d{2})-1000$/.exec(id)
    if (!match) throw new ServiceError('NOT_FOUND')
    const date = match[1]
    const parsed = new Date(`${date}T00:00:00Z`)
    if (!Number.isFinite(parsed.getTime()) || parsed.toISOString().slice(0, 10) !== date || date > churchDate()) {
      throw new ServiceError('NOT_FOUND')
    }
    return sessionFor(date)
  }

  function recordCheckIn(id: string, type: CheckIn['participantType'], identity: string): CheckInResult {
    const event = getEvent(id)
    const key = `${event.id}:${type}:${identity}`
    const records = ledger()
    const existing = records[key]
    if (existing) return { record: existing, alreadyCheckedIn: true }

    assertWindow(event)
    const record: CheckIn = {
      id: key, eventSessionId: event.id, participantType: type, checkedInAt: new Date().toISOString(),
    }
    // Keep the read, uniqueness check and write synchronous on the mini-program JS thread.
    uni.setStorageSync(checkInsKey, { ...records, [key]: record })
    return { record, alreadyCheckedIn: false }
  }

  return {
    async getHome() {
      const date = churchDate()
      return {
        church, churchDate: date, events: [sessionFor(date)],
        notices: makeNotices(date).filter(notice => notice.publishedOn === date && visible(notice)),
        stats: { checkIns: 286 + Object.keys(ledger()).length, groups: 8, members: 126 },
      }
    },
    async signIn() {
      return {
        token: 'local-demo-session', memberId: member.id,
        expiresAt: new Date(Date.now() + 7 * 86_400_000).toISOString(),
      }
    },
    async getMe() {
      if (!currentSession()) throw new ServiceError('AUTH_REQUIRED')
      return { member: memberId() ? member : null, churchDate: churchDate() }
    },
    async getEvent(id) { return getEvent(id) },
    async checkIn(id) {
      if (!currentSession()) throw new ServiceError('AUTH_REQUIRED')
      const identity = memberId()
      if (!identity) throw new ServiceError('MEMBER_REQUIRED')
      return recordCheckIn(id, 'member', identity)
    },
    async guestCheckIn(id, registration) {
      assertGuest(registration)
      return recordCheckIn(id, 'guest', 'device')
    },
    async getGroups() { return groups.filter(visible) },
    async getNotices() { return makeNotices(churchDate()).filter(visible) },
    async getNotice(id) { return findVisible(makeNotices(churchDate()), id) },
    async getResources() { return resources.filter(visible) },
    async getResource(id) { return findVisible(resources, id) },
    async getPlayback(id) {
      const resource = findVisible(resources, id)
      if (resource.type !== 'audio') throw new ServiceError('NOT_FOUND')
      return { url: 'static/demo/stillness.mp3' }
    },
  }
}
