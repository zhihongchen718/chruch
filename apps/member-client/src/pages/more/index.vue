<script setup lang="ts">
import { onShow } from '@dcloudio/uni-app'
import { ref } from 'vue'
import ActionRow from '../../components/ActionRow.vue'
import AsyncState from '../../components/AsyncState.vue'
import { useLoad } from '../../composables/useLoad'
import { languageNames, localize, locale, setLocale, t, type MessageKey } from '../../i18n'
import { churchApi } from '../../services'
import { isDemo } from '../../services/config'
import { authRoute, openPage, showComingSoon, usePageTitle } from '../../services/navigation'
import { session, setSession } from '../../services/session'

const { value: home, loading, error, load } = useLoad(churchApi.getHome)
const signedOut = ref(false)
const features: { title: MessageKey; icon: string }[] = [
  { title: 'giving', icon: 'giving' },
  { title: 'library', icon: 'library' },
  { title: 'partners', icon: 'partners' },
]

usePageTitle('more', true)
onShow(() => { signedOut.value = false; void load() })

function signOut() {
  setSession(null)
  signedOut.value = true
  void load()
}
</script>

<template>
  <view class="page">
    <view class="page-heading">
      <text class="title">{{ t('moreServices') }}</text>
      <text v-if="home" class="muted spaced">{{ localize(home.church.name) }} · {{ localize(home.church.leader) }}</text>
    </view>

    <view class="card">
      <action-row
        v-for="feature in features" :key="feature.title" :icon="feature.icon" :title="t(feature.title)"
        :subtitle="t('comingSoon')" @select="showComingSoon(feature.title)"
      />
    </view>

    <view class="section-head"><text class="heading">{{ t('settings') }}</text></view>
    <view class="card">
      <text class="strong">{{ t('language') }}</text>
      <view class="two language-options">
        <button class="btn btn-small" :class="{ 'btn-secondary': locale !== 'zh' }" @tap="setLocale('zh')">{{ languageNames.zh }}</button>
        <button class="btn btn-small" :class="{ 'btn-secondary': locale !== 'en' }" @tap="setLocale('en')">{{ languageNames.en }}</button>
      </view>
      <action-row icon="lock" :title="t('access')" :subtitle="t('comingSoon')" @select="showComingSoon('access')" />
    </view>

    <view class="section-head"><text class="heading">{{ t('account') }}</text></view>
    <view class="card">
      <text class="muted">
        {{ signedOut ? t('signedOutDone') : !session ? t('signedOut') : isDemo ? t('demoAccountActive') : t('signedIn') }}
      </text>
      <view class="stack">
        <button v-if="session" class="btn btn-secondary block" @tap="signOut">{{ t('signOut') }}</button>
        <button v-else class="btn block" @tap="openPage(authRoute())">{{ t('signIn') }}</button>
      </view>
    </view>
    <view v-if="home" class="card">
      <text class="strong">{{ t('support') }}</text>
      <text class="muted spaced" user-select>{{ home.church.email }}</text>
    </view>
    <async-state v-else :loading="loading" :error="error" @retry="load" />
  </view>
</template>

<style scoped>
.language-options { margin: 9px 0 4px; }
</style>
