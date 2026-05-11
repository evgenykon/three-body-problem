<script setup lang="ts">
defineProps<{
  for?: string
}>()
</script>

<template>
  <label
    :for="for"
    class="label text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-foreground"
  >
    <slot />
  </label>
</template>

<style scoped>
.label {
  display: block;
  margin-bottom: 8px;
}
</style>