<script setup lang="ts">
import { onShow } from '@dcloudio/uni-app'
import { computed } from 'vue'
import AppIcon from '../../components/AppIcon.vue'
import AsyncState from '../../components/AsyncState.vue'
import { useLoad } from '../../composables/useLoad'
import { localize, t, type MessageKey } from '../../i18n'
import { churchApi } from '../../services'
import { authRoute, openPage, usePageTitle } from '../../services/navigation'
import { session } from '../../services/session'
import { ageOnDate, dateLabel } from '../../services/time'

const { value: profile, loading, error, load } = useLoad(churchApi.getMe)
const fields = computed(() => {
  const member = profile.value?.member
  if (!member || !profile.value) return []
  const rows: [MessageKey, string | number][] = [
    ['memberNumber', member.number],
    ['gender', localize(member.gender)],
    ['age', ageOnDate(member.birthday, profile.value.churchDate)],
    ['birthday', dateLabel(member.birthday)],
    ['baptism', t(member.baptismDate ? 'yes' : 'no')],
  ]
  if (member.baptismDate) rows.push(['baptismDate', dateLabel(member.baptismDate)])
  rows.push(['groups', localize(member.group)])
  return rows
})
usePageTitle('members', true)
onShow(() => { if (session.value) void load() })
</script>

<template>
  <view class="page">
    <view class="page-heading"><text class="title">{{ t('profile') }}</text></view>
    <view v-if="!session" class="card">
      <text class="strong">{{ t('signedOut') }}</text>
      <text class="muted spaced">{{ t('signInForProfile') }}</text>
      <view class="stack">
        <button class="btn block" hover-class="press" @tap="openPage(authRoute())">{{ t('signIn') }}</button>
      </view>
    </view>
    <view v-else-if="profile?.member" class="card">
      <view class="member-header">
        <view class="avatar"><app-icon name="members" /></view>
        <view>
          <text class="heading">{{ localize(profile.member.name) }}</text>
          <text class="muted">{{ localize(profile.member.role) }}</text>
        </view>
      </view>
      <view v-for="[key, value] in fields" :key="key" class="kv">
        <text class="muted">{{ t(key) }}</text>
        <text class="kv-value">{{ value }}</text>
      </view>
    </view>
    <view v-else-if="profile" class="callout callout-warning">{{ t('unlinked') }}</view>
    <async-state v-else :loading="loading" :error="error" @retry="load" />
  </view>
</template>

<style scoped>
.member-header { display: flex; align-items: center; gap: 12px; padding-bottom: 12px; border-bottom: 1px solid var(--line); }
.avatar { width: 44px; height: 44px; border-radius: 14px; background: var(--green-soft); display: grid; place-items: center; }
</style>
