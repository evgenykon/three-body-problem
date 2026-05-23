<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  level?: 1 | 2 | 3 | 4 | 5 | 6
  as?: string
}

const props = withDefaults(defineProps<Props>(), {
  level: 1,
  as: 'h1'
})

const levelClasses = computed(() => {
  const levels = {
    1: 'scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl',
    2: 'scroll-m-20 text-3xl font-semibold tracking-tight first:mt-0',
    3: 'scroll-m-20 text-2xl font-semibold tracking-tight',
    4: 'scroll-m-20 text-xl font-semibold tracking-tight',
    5: 'scroll-m-20 text-lg font-semibold tracking-tight',
    6: 'scroll-m-20 text-base font-semibold tracking-tight'
  }
  return levels[props.level]
})
</script>

<template>
  <component
    :is="as"
    :class="['text-foreground', levelClasses]"
  >
    <slot />
  </component>
</template>