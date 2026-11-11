<script setup lang="ts">
import { onShow } from '@dcloudio/uni-app'
import { computed, ref } from 'vue'
import ActionRow from '../../components/ActionRow.vue'
import AsyncState from '../../components/AsyncState.vue'
import { useLoad } from '../../composables/useLoad'
import { localize, t } from '../../i18n'
import { churchApi } from '../../services'
import type { Resource, ResourceType, Testament } from '../../services/contracts'
import { openPage, usePageTitle } from '../../services/navigation'

const { value: resources, loading, error, load } = useLoad(churchApi.getResources)
const testaments = ['all', 'old', 'new'] as const
const types = ['all', 'audio', 'text', 'video', 'testimony'] as const
const testament = ref<Testament | 'all'>('all')
const selectedBook = ref('')
const typeIndex = ref(0)
const byTestament = computed(() => resources.value?.filter(item => testament.value === 'all' || item.testament === testament.value) ?? [])
const books = computed(() => [...new Map(byTestament.value.map(item => [item.bookId, item.book])).entries()])
const bookOptions = computed(() => [t('allBooks'), ...books.value.map(([, title]) => localize(title))])
const bookIndex = computed(() => books.value.findIndex(([id]) => id === selectedBook.value) + 1)
const typeOptions = computed(() => types.map(type => t(type === 'all' ? 'allTypes' : type)))
const filtered = computed(() => {
  const book = books.value[bookIndex.value - 1]?.[0]
  const type: ResourceType | 'all' = types[typeIndex.value] ?? 'all'
  return byTestament.value.filter(item => (!book || item.bookId === book) && (type === 'all' || item.type === type))
})

usePageTitle('resources', true)
onShow(load)
function selectTestament(next: typeof testament.value) {
  if (next !== testament.value) selectedBook.value = ''
  testament.value = next
}

function selectBook(index: number) {
  selectedBook.value = books.value[index - 1]?.[0] ?? ''
}

function resourceSummary(item: Resource) {
  const language = item.locale === 'both' ? 'bilingual' : item.locale === 'zh' ? 'chinese' : 'english'
  const visibility = item.visibility === 'members' ? 'membersOnly' : 'publiclyVisible'
  return [localize(item.book), t(item.type), t(language), t(visibility)].join(' · ')
}
</script>

<template>
  <view class="page">
    <view class="page-heading"><text class="title">{{ t('bibleResources') }}</text></view>
    <template v-if="resources">
      <view class="chips">
        <button
          v-for="option in testaments" :key="option" class="chip" :class="{ 'chip-active': testament === option }"
          @tap="selectTestament(option)"
        >{{ t(option) }}</button>
      </view>
      <view class="two resource-filters">
        <picker :range="bookOptions" :value="bookIndex" @change="selectBook(Number($event.detail.value))">
          <view class="filter-select">{{ bookOptions[bookIndex] ?? bookOptions[0] }} <text aria-hidden="true">⌄</text></view>
        </picker>
        <picker :range="typeOptions" :value="typeIndex" @change="typeIndex = Number($event.detail.value)">
          <view class="filter-select">{{ typeOptions[typeIndex] }} <text aria-hidden="true">⌄</text></view>
        </picker>
      </view>
      <view v-if="filtered.length" class="card">
        <action-row
          v-for="item in filtered" :key="item.id" :icon="item.type === 'audio' ? 'audio' : 'resources'"
          :title="localize(item.title)" :subtitle="resourceSummary(item)"
          @select="openPage('resources/detail?id=' + encodeURIComponent(item.id))"
        />
      </view>
      <async-state v-else :empty="t('resourceEmpty')" />
    </template>
    <async-state v-else :loading="loading" :error="error" @retry="load" />
  </view>
</template>

<style scoped>
.resource-filters { margin-bottom: 12px; }
.filter-select {
  display: flex; justify-content: space-between; align-items: center; gap: 5px; min-height: 44px;
  padding: 8px 10px; border: 1px solid var(--line); border-radius: 11px; background: white;
  color: var(--green-deep); font-size: 13px;
}
</style>
