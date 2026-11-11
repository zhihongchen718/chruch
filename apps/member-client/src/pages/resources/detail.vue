<script setup lang="ts">
import { onHide, onLoad, onShow, onUnload } from '@dcloudio/uni-app'
import { ref } from 'vue'
import AudioPlayer from '../../components/AudioPlayer.vue'
import AsyncState from '../../components/AsyncState.vue'
import { useLoad } from '../../composables/useLoad'
import { localize, t } from '../../i18n'
import { churchApi } from '../../services'
import { usePageTitle } from '../../services/navigation'

const id = ref('')
const visible = ref(false)
const { value: resource, loading, error, load } = useLoad(() => churchApi.getResource(id.value))
usePageTitle('resourceDetail')
onLoad(query => { id.value = query?.id ?? '' })
onShow(() => { visible.value = true; void load() })
const hide = () => { visible.value = false }
onHide(hide)
onUnload(hide)
</script>

<template>
  <view class="page">
    <view v-if="resource" class="card">
      <text class="pill">{{ t(resource.testament) }} · {{ localize(resource.book) }}</text>
      <text class="title spaced">{{ localize(resource.title) }}</text>
      <text class="muted spaced">{{ localize(resource.description) }}</text>
      <text v-if="resource.body" class="body" user-select>{{ localize(resource.body) }}</text>
      <audio-player v-if="visible && resource.type === 'audio'" :resource-id="resource.id" />
      <view v-else-if="resource.type === 'video'" class="callout callout-warning spaced">{{ t('featureUnavailable') }}</view>
    </view>
    <async-state v-else :loading="loading" :error="error" @retry="load" />
  </view>
</template>
