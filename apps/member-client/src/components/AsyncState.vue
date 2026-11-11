<script setup lang="ts">
import { t } from '../i18n'
import { errorMessage, type ErrorCode } from '../services/errors'

defineOptions({ options: { styleIsolation: 'apply-shared' } })
defineProps<{ loading?: boolean; error?: ErrorCode | null; empty?: string }>()
defineEmits<{ retry: [] }>()
</script>

<template>
  <view class="card state" role="status">
    <text v-if="loading" class="muted">{{ t('loading') }}</text>
    <template v-else-if="error">
      <text class="muted">{{ errorMessage(error) }}</text>
      <button class="btn btn-secondary btn-small state-button" hover-class="press" @tap="$emit('retry')">
        {{ t('retry') }}
      </button>
    </template>
    <text v-else class="muted">{{ empty || t('empty') }}</text>
  </view>
</template>

<style scoped>
.state { padding: 24px 16px; text-align: center; }
.state-button { width: fit-content; margin: 12px auto 0; }
</style>
