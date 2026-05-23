<script setup lang="ts">
interface Props {
  fixed?: boolean
}

withDefaults(defineProps<Props>(), {
  fixed: false
})
</script>

<template>
  <nav
    :class="[
      'flex h-16 items-center border-b border-border bg-card px-6',
      fixed && 'fixed top-0 left-0 right-0 z-50'
    ]"
  >
    <div class="flex w-full items-center justify-between">
      <slot />
    </div>
  </nav>
</template>