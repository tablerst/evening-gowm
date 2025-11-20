<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  direction?: 'left' | 'right'
  bgColor?: string // CSS variable or color value
  overlayColor?: string
  image?: string
  height?: string
}

const props = withDefaults(defineProps<Props>(), {
  direction: 'right',
  bgColor: 'var(--color-bg-hero)',
  height: 'auto',
})

const clipPath = computed(() => {
  // 12deg slant
  // right: top-left to bottom-right slant? Or just a simple angle?
  // DESIGN.md says "Hero right side image area background"
  // Let's implement a standard slanted divider look.
  // Polygon points: top-left, top-right, bottom-right, bottom-left

  // If direction is 'right' (slanting down to right):
  // 0 0, 100% 0, 100% 85%, 0 100%

  // If direction is 'left' (slanting down to left):
  // 0 0, 100% 0, 100% 100%, 0 85%

  // Actually, DESIGN.md mentions "Slanted Mask Block" for Hero right side.
  // Let's make it flexible.

  if (props.direction === 'right') {
    return 'polygon(0 0, 100% 0, 100% 85%, 0 100%)'
  } else {
    return 'polygon(0 0, 100% 0, 100% 100%, 0 85%)'
  }
})

const style = computed(() => ({
  backgroundColor: props.bgColor,
  clipPath: clipPath.value,
  minHeight: props.height,
  position: 'relative' as const,
}))

const overlayStyle = computed(() => ({
  backgroundColor: props.overlayColor,
  position: 'absolute' as const,
  top: 0,
  left: 0,
  width: '100%',
  height: '100%',
  zIndex: 1,
}))
</script>

<template>
  <div class="slanted-block" :style="style">
    <div
      v-if="image"
      class="slanted-block__bg-image"
      :style="{ backgroundImage: `url(${image})` }"
    ></div>
    <div v-if="overlayColor" class="slanted-block__overlay" :style="overlayStyle"></div>
    <div class="slanted-block__content">
      <slot></slot>
    </div>
  </div>
</template>

<style scoped lang="scss">
.slanted-block {
  width: 100%;
  overflow: hidden;

  &__bg-image {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-size: cover;
    background-position: center;
    z-index: 0;
  }

  &__content {
    position: relative;
    z-index: 2;
    height: 100%;
  }
}
</style>
