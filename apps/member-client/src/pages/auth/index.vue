<script setup lang="ts">
import { onLoad } from '@dcloudio/uni-app'
import { ref } from 'vue'
import { t } from '../../i18n'
import { churchApi } from '../../services'
import { isDemo } from '../../services/config'
import { codeOf, errorMessage, type ErrorCode } from '../../services/errors'
import { resumeAfterSignIn, usePageTitle } from '../../services/navigation'
import { currentSession, setSession } from '../../services/session'

const eventId = ref<string>()
const signingIn = ref(false)
const error = ref<ErrorCode | null>(null)
usePageTitle('login')
onLoad(query => {
  eventId.value = query?.eventSessionId
  if (currentSession()) resumeAfterSignIn(eventId.value)
})

async function signIn() {
  if (signingIn.value) return
  signingIn.value = true
  error.value = null
  try {
    setSession(await churchApi.signIn())
    resumeAfterSignIn(eventId.value)
  } catch (failure) {
    error.value = codeOf(failure)
  } finally {
    signingIn.value = false
  }
}
</script>

<template>
  <view class="page">
    <view class="page-heading"><text class="title">{{ t('login') }}</text></view>
    <view class="card">
      <text v-if="isDemo" class="pill">{{ t('demo') }}</text>
      <text class="muted spaced">{{ t(isDemo ? 'demoAccount' : 'signInForProfile') }}</text>
      <view class="stack">
        <button class="btn block" :disabled="signingIn" hover-class="press" @tap="signIn">
          {{ t(signingIn ? 'signingIn' : isDemo ? 'demoSignIn' : 'wechatSignIn') }}
        </button>
        <text v-if="error" class="error" role="alert">{{ errorMessage(error) }}</text>
      </view>
    </view>
  </view>
</template>
