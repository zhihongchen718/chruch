<script setup lang="ts">
import { onShow } from '@dcloudio/uni-app'
import { computed, ref } from 'vue'
import AppIcon from '../../components/AppIcon.vue'
import AsyncState from '../../components/AsyncState.vue'
import { useLoad } from '../../composables/useLoad'
import { localize, t } from '../../i18n'
import { churchApi } from '../../services'
import { usePageTitle } from '../../services/navigation'

const { value: groups, loading, error, load } = useLoad(churchApi.getGroups)
const area = ref('')
const areas = computed(() => [...new Set(groups.value?.map(group => group.area))])
const filtered = computed(() => groups.value?.filter(group => !area.value || group.area === area.value) ?? [])

usePageTitle('groups', true)
onShow(async () => {
  const current = await load()
  if (current && !current.some(group => group.area === area.value)) area.value = ''
})
</script>

<template>
  <view class="page">
    <view class="page-heading"><text class="title">{{ t('smallGroups') }}</text></view>
    <template v-if="groups">
      <view v-if="areas.length" class="chips">
        <button class="chip" :class="{ 'chip-active': !area }" @tap="area = ''">{{ t('allAreas') }}</button>
        <button v-for="city in areas" :key="city" class="chip" :class="{ 'chip-active': area === city }" @tap="area = city">
          {{ city }}
        </button>
      </view>
      <view v-for="group in filtered" :key="group.id" class="card">
        <view class="group-header">
          <view class="group-icon"><app-icon name="pin" /></view>
          <view class="group-name"><text class="heading">{{ localize(group.name) }}</text><text class="muted">{{ group.area }}</text></view>
          <text v-if="group.visibility === 'members'" class="pill">{{ t('membersOnly') }}</text>
        </view>
        <view class="kv"><text class="muted">{{ t('meetingPlace') }}</text><text class="kv-value">{{ localize(group.venue) }}</text></view>
        <view v-if="group.leader" class="kv"><text class="muted">{{ t('leader') }}</text><text class="kv-value">{{ localize(group.leader) }}</text></view>
        <view class="kv"><text class="muted">{{ t('reading') }}</text><text class="kv-value">{{ localize(group.reading) }}</text></view>
      </view>
      <async-state v-if="!filtered.length" :empty="t('groupEmpty')" />
    </template>
    <async-state v-else :loading="loading" :error="error" @retry="load" />
  </view>
</template>

<style scoped>
.group-header { display: flex; align-items: center; gap: 10px; padding-bottom: 10px; border-bottom: 1px solid var(--line); }
.group-icon { display: grid; place-items: center; flex: 0 0 38px; height: 38px; border-radius: 12px; background: var(--green-soft); }
.group-name { flex: 1; min-width: 0; }
</style>
