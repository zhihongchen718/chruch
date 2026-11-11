<script setup lang="ts">
import { t } from '../i18n'
import type { CheckIn } from '../services/contracts'
import { dateTimeLabel } from '../services/time'

defineOptions({ options: { styleIsolation: 'apply-shared' } })
defineProps<{ record: CheckIn; timezone: string; newlyCheckedIn: boolean }>()
</script>

<template>
  <view class="callout" role="status">
    <text class="strong">{{ t(newlyCheckedIn ? 'checkInComplete' : 'alreadyCheckedIn') }}</text>
    <text class="muted spaced">{{ t('checkedInAt') }} · {{ dateTimeLabel(record.checkedInAt, timezone) }}</text>
  </view>
</template>
