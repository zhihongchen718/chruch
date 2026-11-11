<script setup lang="ts">
import { onShow } from '@dcloudio/uni-app'
import { useLoad } from '../../composables/useLoad'
import AppIcon from '../../components/AppIcon.vue'
import AsyncState from '../../components/AsyncState.vue'
import { alternateLocale, localize, setLocale, t, type MessageKey } from '../../i18n'
import { churchApi } from '../../services'
import { isDemo } from '../../services/config'
import { eventRoute, goTab, guestRoute, memberCheckInFromHome, openPage, showComingSoon, usePageTitle } from '../../services/navigation'
import { session } from '../../services/session'
import { dateLabel, timeLabel } from '../../services/time'

const { value: home, loading, error, load } = useLoad(churchApi.getHome)
const services: { label: MessageKey; icon: string; open: () => void }[] = [
  { label: 'notices', icon: 'notices', open: () => openPage('notices/index') },
  { label: 'bibleResources', icon: 'resources', open: () => goTab('resources') },
  { label: 'members', icon: 'members', open: () => goTab('members') },
  { label: 'groups', icon: 'groups', open: () => goTab('groups') },
  { label: 'giving', icon: 'giving', open: () => showComingSoon('giving') },
  { label: 'library', icon: 'library', open: () => showComingSoon('library') },
]
usePageTitle('churchFamily', true)
onShow(load)
</script>

<template>
  <view class="hero">
    <view class="brand">
      <view class="brand-mark" aria-hidden="true">✝</view>
      <view class="brand-text">
        <text class="heading">{{ home ? localize(home.church.name) : t('churchFamily') }}</text>
        <text class="brand-subtitle">{{ t('together') }}</text>
      </view>
    </view>
    <button class="language" hover-class="press" @tap="setLocale(alternateLocale)">
      {{ alternateLocale === 'en' ? 'EN' : '中文' }}
    </button>
  </view>

  <view class="page">
    <view class="greeting">
      <view class="greeting-text">
        <text class="title">{{ t('welcomeHome') }}</text>
        <text v-if="home" class="muted spaced">{{ t('today') }} · {{ dateLabel(home.churchDate, true) }}</text>
      </view>
      <text v-if="isDemo" class="pill">{{ t('demo') }}</text>
    </view>

    <template v-if="home">
      <view v-for="event in home.events" :key="event.id" class="card check-card">
        <button class="check-head" hover-class="press" @tap="openPage(eventRoute(event.id))">
          <view class="event-label">
            <text class="eyebrow">{{ t('todaysEvent') }}</text>
            <text class="heading">{{ localize(event.title) }} ›</text>
            <text class="muted">{{ timeLabel(event.startsAt, event.timezone) }} · {{ localize(event.venue) }}</text>
          </view>
          <text v-if="event.attendance" class="pill pill-gold">
            {{ t('checkedInCount', { count: event.attendance.members + event.attendance.guests }) }}
          </text>
        </button>
        <view class="two check-actions">
          <button class="btn" hover-class="press" @tap="memberCheckInFromHome(event.id, Boolean(session))">
            {{ t(session ? 'memberCheckIn' : 'memberLogin') }}
            <text v-if="!session" class="button-caption">{{ t('loginAndCheckIn') }}</text>
          </button>
          <button class="btn btn-secondary" hover-class="press" @tap="openPage(guestRoute(event.id))">
            {{ t('guestRegistration') }}
            <text class="button-caption">{{ t('registerAndCheckIn') }}</text>
          </button>
        </view>
      </view>
      <async-state v-if="!home.events.length" :empty="t('noEvents')" />
    </template>
    <async-state v-else :loading="loading" :error="error" @retry="load" />

    <view class="section-head"><text class="heading">{{ t('quickServices') }}</text></view>
    <view class="services">
      <button v-for="service in services" :key="service.icon" class="service" hover-class="press" @tap="service.open">
        <view class="service-icon"><app-icon :name="service.icon" /></view>
        <text>{{ t(service.label) }}</text>
      </button>
    </view>

    <view v-if="home" class="section-head">
      <text class="heading">{{ t('todaysNotices') }}</text>
      <button class="link" hover-class="press" @tap="openPage('notices/index')">{{ t('viewAll') }} ›</button>
    </view>
    <view v-if="home?.notices.length" class="card">
      <button
        v-for="notice in home.notices" :key="notice.id" class="notice" hover-class="press"
        @tap="openPage('notices/detail?id=' + encodeURIComponent(notice.id))"
      >
        <view class="dot" aria-hidden="true" />
        <view class="notice-text">
          <text class="strong">{{ localize(notice.title) }}</text>
          <text class="muted">{{ localize(notice.summary) }}</text>
        </view>
        <text class="muted" aria-hidden="true">›</text>
      </button>
    </view>
    <async-state v-else-if="home" :empty="t('noticesEmpty')" />

    <view v-if="home?.stats" class="card stats">
      <view class="stat"><text class="stat-number">{{ home.stats.checkIns }}</text><text class="muted">{{ t('checkIns') }}</text></view>
      <view class="stat"><text class="stat-number">{{ home.stats.groups }}</text><text class="muted">{{ t('groups') }}</text></view>
      <view class="stat"><text class="stat-number">{{ home.stats.members }}</text><text class="muted">{{ t('members') }}</text></view>
    </view>
  </view>
</template>

<style scoped>
.hero {
  display: flex; align-items: flex-start; justify-content: space-between; gap: 10px;
  padding: 18px var(--space) 24px; border-radius: 0 0 26px 26px;
  background: linear-gradient(135deg, var(--green-deep), #43806c); color: white;
}
.brand { display: flex; gap: 10px; align-items: center; min-width: 0; }
.brand-mark {
  width: 39px; height: 39px; flex: 0 0 39px; display: flex; justify-content: center; align-items: center;
  border: 1px solid #ffffff45; border-radius: 13px; background: #ffffff20; font-size: 25px;
}
.brand-text { min-width: 0; }
.brand-subtitle { display: block; margin-top: 3px; color: #e7f1eb; font-size: 12px; }
.language {
  flex: 0 0 auto; min-height: 36px; padding: 5px 11px; border: 1px solid #ffffff70;
  border-radius: 22px; background: #ffffff1a; font-size: 12px;
}
.greeting { display: flex; align-items: flex-start; justify-content: space-between; gap: 8px; margin-bottom: 14px; }
.greeting-text { flex: 1; min-width: 0; }
.greeting .title { font-size: 23px; }
.greeting .pill { flex: 0 0 auto; }
.check-card { border-color: #ecdcbc; background: linear-gradient(130deg, #fff9ee, #f7eddc); }
.check-head { display: flex; align-items: flex-start; justify-content: space-between; gap: 9px; width: 100%; }
.event-label { min-width: 0; }
.eyebrow { display: block; color: var(--gold-ink); font-weight: 750; font-size: 11px; margin-bottom: 3px; }
.check-head .muted { margin-top: 4px; }
.check-actions { margin-top: 13px; }
.button-caption { display: block; font-size: 11px; font-weight: 400; margin-top: 3px; }
.services { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 9px; }
.service {
  width: 100%; min-height: 78px; display: flex; flex-direction: column; align-items: center; justify-content: center;
  gap: 5px; padding: 8px 5px; border: 1px solid var(--line); border-radius: 14px; background: white;
  text-align: center; font-size: 13px; font-weight: 650; line-height: 1.35;
}
.service-icon {
  display: flex; align-items: center; justify-content: center;
  width: 32px; height: 32px; border-radius: 10px; background: var(--green-soft);
}
.notice { display: flex; align-items: center; gap: 10px; width: 100%; padding: 9px 0; border-radius: 0; }
.notice + .notice { border-top: 1px solid var(--line); }
.notice:first-child { padding-top: 0; }
.notice:last-child { padding-bottom: 0; }
.notice-text { flex: 1; min-width: 0; }
.dot { width: 7px; height: 7px; flex: 0 0 7px; border-radius: 50%; background: var(--gold); }
</style>
