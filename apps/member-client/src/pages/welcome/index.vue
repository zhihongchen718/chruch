<script setup lang="ts">
import { onLoad } from '@dcloudio/uni-app'
import { ref } from 'vue'
import { hasLanguage, messageIn, setLocale, type Locale } from '../../i18n'
import { goTab, usePageTitle } from '../../services/navigation'

const selection = ref<Locale | null>(null)
usePageTitle('churchFamily')
onLoad(() => { if (hasLanguage()) goTab('home') })

function continueToHome() {
  if (!selection.value) return
  setLocale(selection.value)
  goTab('home')
}
</script>

<template>
  <view class="welcome page">
    <view class="welcome-mark" aria-hidden="true">✝</view>
    <text class="title">{{ messageIn('welcome', selection ?? 'zh') }}</text>
    <text class="muted spaced">{{ messageIn('welcome', selection === 'en' ? 'zh' : 'en') }}</text>

    <view class="language-picker">
      <text class="strong">{{ messageIn('chooseLanguage', 'zh') }} / {{ messageIn('chooseLanguage', 'en') }}</text>
      <button class="choice card" :class="{ selected: selection === 'zh' }" hover-class="press" @tap="selection = 'zh'">
        <text class="strong">{{ messageIn('chinese', 'zh') }} <text class="choice-alt">{{ messageIn('chinese', 'en') }}</text></text>
        <text v-if="selection === 'zh'" class="checkmark" aria-hidden="true">✓</text>
      </button>
      <button class="choice card" :class="{ selected: selection === 'en' }" hover-class="press" @tap="selection = 'en'">
        <text class="strong">{{ messageIn('english', 'en') }} <text class="choice-alt">{{ messageIn('english', 'zh') }}</text></text>
        <text v-if="selection === 'en'" class="checkmark" aria-hidden="true">✓</text>
      </button>
      <button class="btn block" :disabled="!selection" hover-class="press" @tap="continueToHome">
        {{ messageIn('getStarted', selection ?? 'zh') }} / {{ messageIn('getStarted', selection === 'en' ? 'zh' : 'en') }}
      </button>
    </view>
  </view>
</template>

<style scoped>
.welcome {
  min-height: 100vh; padding: 46px 24px calc(24px + env(safe-area-inset-bottom));
  background: linear-gradient(155deg, #e4f0e6, #fbf8ef 64%);
}
.welcome-mark {
  display: flex; align-items: center; justify-content: center; width: 62px; height: 62px;
  margin-bottom: 19px; border-radius: 20px; background: #f5faf5; color: var(--green); font-size: 36px;
}
.welcome .title { font-size: 30px; }
.language-picker { margin-top: 34px; }
.choice {
  width: 100%; display: flex; align-items: center; justify-content: space-between;
  margin: 9px 0; min-height: 56px;
}
.choice.selected { border-color: var(--green); background: #f8fcf9; }
.choice-alt { font-weight: 400; margin-left: 4px; color: var(--muted); }
.checkmark { color: var(--green); font-weight: 700; }
.language-picker .btn { margin-top: 16px; }
</style>
