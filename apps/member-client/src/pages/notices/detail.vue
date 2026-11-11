<script setup lang="ts">
import { onLoad, onShow } from '@dcloudio/uni-app'
import { ref } from 'vue'
import AsyncState from '../../components/AsyncState.vue'
import { useLoad } from '../../composables/useLoad'
import { localize, t } from '../../i18n'
import { churchApi } from '../../services'
import { usePageTitle } from '../../services/navigation'
import { dateLabel } from '../../services/time'

const id = ref('')
const { value: notice, loading, error, load } = useLoad(() => churchApi.getNotice(id.value))
usePageTitle('noticeDetail')
onLoad(query => { id.value = query?.id ?? '' })
onShow(load)
</script>

<template>
  <view class="page">
    <view v-if="notice" class="card">
      <text class="pill">{{ t(notice.category) }}</text>
      <text class="title spaced">{{ localize(notice.title) }}</text>
      <text class="muted spaced">{{ dateLabel(notice.publishedOn) }} · {{ localize(notice.summary) }}</text>
      <text class="body" user-select>{{ localize(notice.body) }}</text>
    </view>
    <async-state v-else :loading="loading" :error="error" @retry="load" />
  </view>
</template>
