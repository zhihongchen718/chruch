import { locale } from '../i18n'

const localeTag = () => locale.value === 'zh' ? 'zh-CN' : 'en-CA'
const clocks = new Map<string, Intl.DateTimeFormat>()

function localParts(timestamp: number, timezone: string) {
  let formatter = clocks.get(timezone)
  if (!formatter) {
    formatter = new Intl.DateTimeFormat('en-CA', {
      timeZone: timezone, year: 'numeric', month: '2-digit', day: '2-digit',
      hour: '2-digit', minute: '2-digit', second: '2-digit', hourCycle: 'h23',
    })
    clocks.set(timezone, formatter)
  }
  return Object.fromEntries(formatter.formatToParts(timestamp).map(({ type, value }) => [type, value]))
}

export function dateInZone(timestamp: number, timezone: string) {
  const { year, month, day } = localParts(timestamp, timezone)
  return `${year}-${month}-${day}`
}

export function dateLabel(date: string, weekday = false) {
  return new Intl.DateTimeFormat(localeTag(), {
    timeZone: 'UTC', year: 'numeric', month: 'long', day: 'numeric',
    weekday: weekday ? 'long' : undefined,
  }).format(new Date(`${date}T12:00:00Z`))
}

export function timeLabel(value: string, timezone: string) {
  return new Intl.DateTimeFormat(localeTag(), {
    timeZone: timezone, hour: 'numeric', minute: '2-digit',
  }).format(new Date(value))
}

export function dateTimeLabel(value: string, timezone: string) {
  return `${dateLabel(dateInZone(Date.parse(value), timezone))} · ${timeLabel(value, timezone)}`
}

export function addDays(date: string, days: number) {
  const utc = Date.parse(`${date}T00:00:00Z`) + days * 86_400_000
  return new Date(utc).toISOString().slice(0, 10)
}

export function instantInZone(date: string, time: string, timezone: string) {
  const wall = Date.parse(`${date}T${time}:00Z`)
  const offsetAt = (timestamp: number) => {
    const { year, month, day, hour, minute, second } = localParts(timestamp, timezone)
    return Date.parse(`${year}-${month}-${day}T${hour}:${minute}:${second}Z`) - timestamp
  }
  const candidate = wall - offsetAt(wall)
  return new Date(wall - offsetAt(candidate)).toISOString()
}

export function ageOnDate(birthday: string, today: string) {
  const years = Number(today.slice(0, 4)) - Number(birthday.slice(0, 4))
  return years - (today.slice(5) < birthday.slice(5) ? 1 : 0)
}
