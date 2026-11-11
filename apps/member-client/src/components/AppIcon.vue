<script setup lang="ts">
defineProps<{ name: string }>()
</script>

<template>
  <image class="app-icon" :src="`/static/icons/${name}.png`" mode="aspectFit" aria-hidden="true" />
</template>

<style scoped>
.app-icon { width: 21px; height: 21px; display: block; }
</style>
