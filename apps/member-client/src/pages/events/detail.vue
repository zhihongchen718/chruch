<script setup lang="ts">
import { onLoad, onShow } from '@dcloudio/uni-app'
import { computed, ref, watch } from 'vue'
import AsyncState from '../../components/AsyncState.vue'
import CheckInReceipt from '../../components/CheckInReceipt.vue'
import { useLoad } from '../../composables/useLoad'
import { localize, t } from '../../i18n'
import { churchApi } from '../../services'
import { checkInWindow } from '../../services/checkin'
import { codeOf, errorMessage, type ErrorCode } from '../../services/errors'
import { authRoute, guestRoute, openPage, takeCheckInIntent, usePageTitle } from '../../services/navigation'
import { currentSession, session } from '../../services/session'
import { dateTimeLabel, timeLabel } from '../../services/time'

const id = ref('')
const { value: event, loading, error, load } = useLoad(() => churchApi.getEvent(id.value))
const submitting = ref(false)
const checkInError = ref<ErrorCode | null>(null)
const newlyCheckedIn = ref(false)
const window = computed(() => event.value ? checkInWindow(event.value) : 'closed')
usePageTitle('eventCheckIn')

onLoad(query => { id.value = query?.id ?? '' })
onShow(refresh)
watch(session, () => { newlyCheckedIn.value = false })

async function refresh() {
  const detail = await load()
  if (detail && takeCheckInIntent(detail.id) && !detail.memberCheckIn && checkInWindow(detail) === 'open') {
    await submit()
  }
}

async function submit() {
  const detail = event.value
  if (!detail || submitting.value || detail.memberCheckIn) return
  const account = currentSession()
  if (!account) {
    openPage(authRoute(detail.id))
    return
  }

  submitting.value = true
  checkInError.value = null
  try {
    const { record, alreadyCheckedIn } = await churchApi.checkIn(detail.id)
    if (account !== currentSession()) return
    newlyCheckedIn.value = !alreadyCheckedIn
    const attendance = detail.attendance
    event.value = {
      ...detail,
      memberCheckIn: record,
      attendance: attendance && { ...attendance, members: attendance.members + Number(!alreadyCheckedIn) },
    }
    // A duplicate may have been committed by another client since the detail was loaded.
    if (alreadyCheckedIn) await load()
  } catch (failure) {
    checkInError.value = codeOf(failure)
    if (checkInError.value === 'SESSION_EXPIRED') await load()
  } finally {
    submitting.value = false
  }
}
</script>

<template>
  <view class="page">
    <template v-if="event">
      <view class="page-heading">
        <text class="title">{{ localize(event.title) }}</text>
        <text class="muted spaced">
          {{ dateTimeLabel(event.startsAt, event.timezone) }} – {{ timeLabel(event.endsAt, event.timezone) }} · {{ localize(event.venue) }}
        </text>
      </view>
      <view class="card">
        <text>{{ localize(event.description) }}</text>
        <text class="muted spaced">
          {{ t('window') }} · {{ dateTimeLabel(event.opensAt, event.timezone) }} – {{ dateTimeLabel(event.closesAt, event.timezone) }}
        </text>
        <view class="stack">
          <check-in-receipt
            v-if="event.memberCheckIn" :record="event.memberCheckIn" :timezone="event.timezone"
            :newly-checked-in="newlyCheckedIn"
          />
          <view v-if="event.guestCheckIn" class="callout">
            <text class="strong">{{ t('guestAttendees') }} · {{ t('alreadyCheckedIn') }}</text>
            <text class="muted spaced">{{ dateTimeLabel(event.guestCheckIn.checkedInAt, event.timezone) }}</text>
          </view>
          <view v-if="window !== 'open'" class="callout callout-warning">
            {{ t(window === 'upcoming' ? 'windowUpcoming' : 'windowClosed') }}
          </view>
          <template v-else>
            <button v-if="!event.memberCheckIn" class="btn block" :disabled="submitting" hover-class="press" @tap="submit">
              {{ t(submitting ? 'checkingIn' : session ? 'checkIn' : 'loginAndCheckIn') }}
            </button>
            <button
              v-if="!event.guestCheckIn" class="btn btn-secondary block" hover-class="press"
              @tap="openPage(guestRoute(event.id))"
            >
              {{ t('guestRegistration') }}
            </button>
          </template>
          <text v-if="checkInError" class="error" role="alert">{{ errorMessage(checkInError) }}</text>
        </view>
      </view>
      <template v-if="event.attendance">
        <view class="section-head"><text class="heading">{{ t('attendance') }}</text></view>
        <view class="card stats">
          <view class="stat"><text class="stat-number">{{ event.attendance.members }}</text><text class="muted">{{ t('memberAttendees') }}</text></view>
          <view class="stat"><text class="stat-number">{{ event.attendance.guests }}</text><text class="muted">{{ t('guestAttendees') }}</text></view>
          <view class="stat"><text class="stat-number">{{ event.attendance.members + event.attendance.guests }}</text><text class="muted">{{ t('total') }}</text></view>
        </view>
      </template>
    </template>
    <async-state v-else :loading="loading" :error="error" @retry="refresh" />
  </view>
</template>
