<script setup lang="ts">
interface Props {
  size?: 'sm' | 'default' | 'lg' | 'xl' | 'full'
}

withDefaults(defineProps<Props>(), {
  size: 'default'
})
</script>

<template>
  <div
    :class="[
      'mx-auto w-full',
      size === 'sm' && 'max-w-sm',
      size === 'default' && 'max-w-7xl',
      size === 'lg' && 'max-w-6xl',
      size === 'xl' && 'max-w-5xl',
      size === 'full' && 'max-w-full'
    ]"
  >
    <slot />
  </div>
</template>