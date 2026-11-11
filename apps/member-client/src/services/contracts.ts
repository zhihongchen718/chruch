import type { Bilingual, Locale } from '../i18n'

export interface Church {
  name: Bilingual
  leader: Bilingual
  email: string
  timezone: string
}

export interface Session {
  token: string
  expiresAt: string
  memberId: string | null
}

export interface Member {
  id: string
  number: string
  name: Bilingual
  gender: Bilingual
  birthday: string
  baptismDate: string | null
  role: Bilingual
  group: Bilingual
}

export interface Profile {
  member: Member | null
  churchDate: string
}

export interface Attendance {
  members: number
  guests: number
}

export interface EventSession {
  id: string
  title: Bilingual
  description: Bilingual
  venue: Bilingual
  timezone: string
  startsAt: string
  endsAt: string
  opensAt: string
  closesAt: string
  attendance: Attendance | null
  memberCheckIn: CheckIn | null
  guestCheckIn: CheckIn | null
}

export interface CheckIn {
  id: string
  eventSessionId: string
  participantType: 'member' | 'guest'
  checkedInAt: string
}

export interface CheckInResult {
  record: CheckIn
  alreadyCheckedIn: boolean
}

export interface GuestRegistration {
  name: string
  contact: string
  firstVisit: boolean
  eventPass?: string
}

export interface Group {
  id: string
  name: Bilingual
  area: string
  venue: Bilingual
  leader?: Bilingual
  reading: Bilingual
  visibility: 'public' | 'members'
}

export type NoticeCategory = 'sermon' | 'youth' | 'volunteer' | 'birthdayNotice' | 'prayer' | 'special'
export interface Notice {
  id: string
  category: NoticeCategory
  title: Bilingual
  summary: Bilingual
  body: Bilingual
  publishedOn: string
  visibility: 'public' | 'members'
}

export type ResourceType = 'audio' | 'text' | 'video' | 'testimony'
export type Testament = 'old' | 'new'
export interface Resource {
  id: string
  testament: Testament
  book: Bilingual
  bookId: string
  type: ResourceType
  title: Bilingual
  description: Bilingual
  body?: Bilingual
  locale: Locale | 'both'
  visibility: 'public' | 'members'
}

export interface Playback {
  url: string
  expiresAt?: string
}

export interface Home {
  church: Church
  churchDate: string
  events: EventSession[]
  notices: Notice[]
  stats: { checkIns: number; groups: number; members: number } | null
}

export interface ChurchService {
  getHome(): Promise<Home>
  signIn(): Promise<Session>
  getMe(): Promise<Profile>
  getEvent(id: string): Promise<EventSession>
  checkIn(id: string): Promise<CheckInResult>
  guestCheckIn(id: string, registration: GuestRegistration): Promise<CheckInResult>
  getGroups(): Promise<Group[]>
  getNotices(): Promise<Notice[]>
  getNotice(id: string): Promise<Notice>
  getResources(): Promise<Resource[]>
  getResource(id: string): Promise<Resource>
  getPlayback(id: string): Promise<Playback>
}
