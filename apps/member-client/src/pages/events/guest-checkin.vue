<script setup lang="ts">
import { onLoad, onShow } from '@dcloudio/uni-app'
import { computed, ref } from 'vue'
import AsyncState from '../../components/AsyncState.vue'
import CheckInReceipt from '../../components/CheckInReceipt.vue'
import { useLoad } from '../../composables/useLoad'
import { localize, t } from '../../i18n'
import { churchApi } from '../../services'
import { checkInWindow, validateGuest } from '../../services/checkin'
import { isDemo } from '../../services/config'
import type { CheckInResult } from '../../services/contracts'
import { codeOf, errorMessage, type ErrorCode } from '../../services/errors'
import { eventRoute, usePageTitle } from '../../services/navigation'
import { dateTimeLabel } from '../../services/time'

const id = ref('')
let eventPass: string | undefined
const { value: event, loading, error, load } = useLoad(() => churchApi.getEvent(id.value))
const name = ref('')
const contact = ref('')
const firstVisit = ref<boolean | null>(null)
const nameError = ref(false)
const contactError = ref(false)
const visitError = ref(false)
const submitting = ref(false)
const submissionError = ref<ErrorCode | null>(null)
const result = ref<CheckInResult | null>(null)
const record = computed(() => result.value?.record ?? event.value?.guestCheckIn ?? null)
const window = computed(() => event.value ? checkInWindow(event.value) : 'closed')
usePageTitle('guestRegistration')
onLoad(query => {
  id.value = query?.id ?? ''
  if (query?.pass) {
    try { eventPass = decodeURIComponent(query.pass) } catch { eventPass = undefined }
  }
})
onShow(load)

function fillExample() {
  name.value = t('demoGuestName')
  contact.value = 'visitor@example.com'
  firstVisit.value = true
  nameError.value = contactError.value = visitError.value = false
}

async function submit() {
  if (!event.value || submitting.value || record.value) return
  const invalid = validateGuest(name.value, contact.value)
  nameError.value = invalid === 'GUEST_NAME_REQUIRED'
  contactError.value = invalid === 'GUEST_CONTACT_INVALID'
  visitError.value = firstVisit.value === null
  if (invalid || firstVisit.value === null) return

  submitting.value = true
  submissionError.value = null
  try {
    result.value = await churchApi.guestCheckIn(id.value, {
      name: name.value.trim(), contact: contact.value.trim(), firstVisit: firstVisit.value, eventPass,
    })
    name.value = contact.value = ''
    firstVisit.value = null
  } catch (failure) {
    submissionError.value = codeOf(failure)
  } finally {
    submitting.value = false
  }
}

function viewEvent() {
  if (getCurrentPages().at(-2)?.route === 'pages/events/detail') uni.navigateBack()
  else uni.redirectTo({ url: `/pages/${eventRoute(id.value)}` })
}
</script>

<template>
  <view class="page">
    <view class="page-heading">
      <text class="title">{{ t('guestRegistration') }}</text>
      <text v-if="event" class="muted spaced">{{ localize(event.title) }} · {{ dateTimeLabel(event.startsAt, event.timezone) }}</text>
    </view>
    <view v-if="event && record" class="card">
      <check-in-receipt :record="record" :timezone="event.timezone" :newly-checked-in="result?.alreadyCheckedIn === false" />
      <view class="stack"><button class="btn btn-secondary block" @tap="viewEvent">{{ t('backToEvent') }}</button></view>
    </view>
    <view v-else-if="event && window !== 'open'" class="callout callout-warning">
      {{ t(window === 'upcoming' ? 'windowUpcoming' : 'windowClosed') }}
    </view>
    <view v-else-if="event" class="card">
      <text class="muted">{{ t(isDemo ? 'demoGuestIntro' : 'guestIntro') }}</text>
      <button v-if="isDemo" class="link" hover-class="press" @tap="fillExample">{{ t('fillExample') }}</button>
      <form @submit="submit">
        <view class="fields">
          <view>
            <label class="field-label" for="guest-name">{{ t('name') }}</label>
            <input id="guest-name" v-model="name" class="input" :maxlength="60" :disabled="submitting" :placeholder="t('namePlaceholder')" @input="nameError = false" />
            <text v-if="nameError" class="error" role="alert">{{ t('guestNameRequired') }}</text>
          </view>
          <view>
            <label class="field-label" for="guest-contact">{{ t('contact') }}</label>
            <input id="guest-contact" v-model="contact" class="input" :maxlength="120" :disabled="submitting" :placeholder="t('contactPlaceholder')" @input="contactError = false" />
            <text v-if="contactError" class="error" role="alert">{{ t('guestContactInvalid') }}</text>
          </view>
          <view>
            <text class="field-label">{{ t('firstVisit') }}</text>
            <view class="two">
              <button class="btn" :class="{ 'btn-secondary': firstVisit !== true }" :disabled="submitting" @tap="firstVisit = true; visitError = false">{{ t('yes') }}</button>
              <button class="btn" :class="{ 'btn-secondary': firstVisit !== false }" :disabled="submitting" @tap="firstVisit = false; visitError = false">{{ t('no') }}</button>
            </view>
            <text v-if="visitError" class="error" role="alert">{{ t('guestFirstRequired') }}</text>
          </view>
        </view>
        <view class="stack">
          <button class="btn block" form-type="submit" :disabled="submitting" hover-class="press">
            {{ t(submitting ? 'checkingIn' : 'registerAndCheckIn') }}
          </button>
          <text v-if="submissionError" class="error" role="alert">{{ errorMessage(submissionError) }}</text>
        </view>
      </form>
    </view>
    <async-state v-else :loading="loading" :error="error" @retry="load" />
  </view>
</template>
