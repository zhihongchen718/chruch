<script setup lang="ts">
import AppIcon from './AppIcon.vue'
defineOptions({ options: { styleIsolation: 'apply-shared' } })
defineProps<{ icon: string; title: string; subtitle?: string; badge?: string }>()
defineEmits<{ select: [] }>()
</script>

<template>
  <button class="action-row" hover-class="press" @tap="$emit('select')">
    <view class="row-icon"><app-icon :name="icon" /></view>
    <view class="row-text">
      <text class="strong">{{ title }}</text>
      <text v-if="subtitle" class="muted">{{ subtitle }}</text>
    </view>
    <text v-if="badge" class="pill">{{ badge }}</text>
    <text class="arrow" aria-hidden="true">›</text>
  </button>
</template>

<style scoped>
.action-row {
  width: 100%; display: flex; gap: 10px; align-items: center; padding: 11px 0;
  border-radius: 0; border-bottom: 1px solid var(--line);
}
.action-row:last-child { border-bottom: 0; }
.row-icon {
  display: flex; align-items: center; justify-content: center;
  flex: 0 0 34px; height: 34px; border-radius: 10px; background: var(--green-soft);
}
.row-text { flex: 1; min-width: 0; overflow-wrap: break-word; }
.arrow { font-size: 22px; color: var(--muted); }
</style>
