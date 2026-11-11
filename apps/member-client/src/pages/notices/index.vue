<script setup lang="ts">
import { onShow } from '@dcloudio/uni-app'
import { computed, ref } from 'vue'
import ActionRow from '../../components/ActionRow.vue'
import AsyncState from '../../components/AsyncState.vue'
import { useLoad } from '../../composables/useLoad'
import { localize, t } from '../../i18n'
import { churchApi } from '../../services'
import type { NoticeCategory } from '../../services/contracts'
import { authRoute, openPage, usePageTitle } from '../../services/navigation'
import { session } from '../../services/session'
import { dateLabel } from '../../services/time'

const { value: notices, loading, error, load } = useLoad(churchApi.getNotices)
const categories = ['all', 'sermon', 'youth', 'volunteer', 'birthdayNotice', 'prayer', 'special'] as const
const category = ref<NoticeCategory | 'all'>('all')
const filtered = computed(() => notices.value?.filter(item => category.value === 'all' || item.category === category.value) ?? [])

usePageTitle('notices')
onShow(load)
</script>

<template>
  <view class="page">
    <view class="page-heading"><text class="title">{{ t('notices') }}</text></view>
    <template v-if="notices">
      <view class="chips">
        <button v-for="option in categories" :key="option" class="chip" :class="{ 'chip-active': category === option }" @tap="category = option">
          {{ t(option) }}
        </button>
      </view>
      <view v-if="filtered.length" class="card">
        <action-row
          v-for="item in filtered" :key="item.id" icon="notices" :title="localize(item.title)"
          :subtitle="dateLabel(item.publishedOn) + ' · ' + localize(item.summary)"
          @select="openPage('notices/detail?id=' + encodeURIComponent(item.id))"
        />
      </view>
      <view v-else-if="category === 'prayer' && !session" class="card">
        <text class="muted">{{ t('signInRequired') }}</text>
        <view class="stack"><button class="btn btn-secondary block" @tap="openPage(authRoute())">{{ t('signIn') }}</button></view>
      </view>
      <async-state v-else :empty="t('noticesEmpty')" />
    </template>
    <async-state v-else :loading="loading" :error="error" @retry="load" />
  </view>
</template>
