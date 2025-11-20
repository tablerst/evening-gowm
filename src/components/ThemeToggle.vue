<script setup lang="ts">
import { ref, onMounted } from 'vue'

type Theme = 'light' | 'dark'

const theme = ref<Theme>('light')

function applyTheme(t: Theme) {
  if (typeof document === 'undefined') return
  if (t === 'dark') document.documentElement.setAttribute('data-theme', 'dark')
  else document.documentElement.removeAttribute('data-theme')
}

function setTheme(t: Theme) {
  theme.value = t
  applyTheme(t)
  try {
    localStorage.setItem('theme', t)
  } catch (e) {
    // ignore
  }
}

function toggle() {
  setTheme(theme.value === 'dark' ? 'light' : 'dark')
}

onMounted(() => {
  try {
    const saved = localStorage.getItem('theme') as Theme | null
    if (saved === 'dark' || saved === 'light') setTheme(saved)
    else setTheme('light')
  } catch (e) {
    setTheme('light')
  }
})
</script>

<template>
  <button class="btn" @click="toggle" :aria-pressed="theme === 'dark'">
    {{ theme === 'dark' ? '切换到浅色' : '切换到深色' }}
  </button>
</template>

<style scoped>
/* 组件层面无需额外样式；按钮样式来自全局按钮组件样式表 */
</style>
