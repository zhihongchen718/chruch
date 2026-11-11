<script setup lang="ts">
import { onBeforeUnmount, ref } from 'vue'
import { t, type MessageKey } from '../i18n'
import { churchApi } from '../services'
import { audioSource } from '../services/audio'
import type { Playback } from '../services/contracts'
import { codeOf, errorMessage, type ErrorCode } from '../services/errors'

defineOptions({ options: { styleIsolation: 'apply-shared' } })
const props = defineProps<{ resourceId: string }>()

type PlayerState = 'idle' | 'loading' | 'playing' | 'paused' | 'ended' | 'error'
const labels: Record<PlayerState, MessageKey> = {
  idle: 'audioProgress', loading: 'audioLoading', playing: 'playing',
  paused: 'paused', ended: 'audioEnded', error: 'audioError',
}
const state = ref<PlayerState>('idle')
const position = ref(0)
const duration = ref(0)
const serviceError = ref<ErrorCode | null>(null)

let context: UniApp.InnerAudioContext | undefined
let playback: Playback | undefined
let generation = 0
let timer: ReturnType<typeof setTimeout> | undefined

const expired = () => playback?.expiresAt && Date.parse(playback.expiresAt) <= Date.now()
const clock = (seconds: number) => `${Math.floor(seconds / 60)}:${String(Math.floor(seconds % 60)).padStart(2, '0')}`

function release() {
  generation += 1
  clearTimeout(timer)
  context?.destroy()
  context = undefined
  playback = undefined
}

function fail(error?: ErrorCode) {
  release()
  serviceError.value = error ?? null
  state.value = 'error'
}

function waiting() {
  state.value = 'loading'
  clearTimeout(timer)
  timer = setTimeout(() => fail(), 20_000)
}

async function start(renewed = false) {
  release()
  const request = generation
  serviceError.value = null
  waiting()

  try {
    const authorization = await churchApi.getPlayback(props.resourceId)
    const url = await audioSource(authorization.url)
    if (request !== generation) return

    playback = authorization
    const audio = uni.createInnerAudioContext()
    context = audio
    audio.startTime = position.value
    audio.onCanplay(() => {
      if (context === audio && audio.duration > 0) duration.value = audio.duration
    })
    audio.onPlay(() => {
      if (context !== audio) return
      clearTimeout(timer)
      state.value = 'playing'
    })
    audio.onPause(() => {
      if (context !== audio) return
      clearTimeout(timer)
      state.value = 'paused'
    })
    audio.onTimeUpdate(() => {
      if (context !== audio) return
      if (audio.duration > 0) duration.value = audio.duration
      if (Number.isFinite(audio.currentTime)) position.value = audio.currentTime
      if (state.value === 'loading' && !audio.paused) {
        clearTimeout(timer)
        state.value = 'playing'
      }
    })
    audio.onWaiting(() => { if (context === audio) waiting() })
    audio.onEnded(() => {
      if (context !== audio) return
      release()
      position.value = 0
      state.value = 'ended'
    })
    audio.onError(() => {
      if (context !== audio) return
      if (!renewed && expired()) void start(true)
      else fail()
    })
    audio.src = url
    audio.play()
  } catch (error) {
    if (request === generation) fail(codeOf(error))
  }
}

function toggle() {
  if (state.value === 'loading') return
  if (state.value === 'playing' && context) {
    context.pause()
    return
  }
  if (context && !expired()) {
    waiting()
    context.play()
  } else {
    void start()
  }
}

function seek(seconds: number) {
  if (!context || !Number.isFinite(seconds)) return
  position.value = Math.min(seconds, duration.value)
  context.seek(position.value)
}

onBeforeUnmount(release)
</script>

<template>
  <view class="audio-card">
    <text class="strong">{{ t('audio') }}</text>
    <slider
      :min="0" :max="Math.max(1, Math.ceil(duration))" :value="Math.floor(position)"
      :disabled="duration < 1 || state === 'idle' || state === 'loading' || state === 'error' || state === 'ended'"
      active-color="#316b58" background-color="#d7e5db" :block-size="15"
      :aria-label="t('audioProgress')" @change="seek(Number($event.detail.value))"
    />
    <view class="time-line">
      <text>{{ clock(position) }}</text><text>{{ clock(duration) }}</text>
    </view>
    <view class="stack">
      <button class="btn block" :disabled="state === 'loading'" hover-class="press" @tap="toggle">
        {{ t(state === 'loading' ? 'audioLoading' : state === 'playing' ? 'pause' : state === 'error' ? 'retry' : 'play') }}
      </button>
      <text v-if="state !== 'idle' && state !== 'loading'" class="muted" role="status">
        {{ serviceError ? errorMessage(serviceError) : t(labels[state]) }}
      </text>
    </view>
  </view>
</template>

<style scoped>
.audio-card { border-top: 1px solid var(--line); margin-top: 16px; padding-top: 14px; }
slider { margin: 8px 0; }
.time-line { display: flex; justify-content: space-between; color: var(--muted); font-size: 12px; }
</style>
