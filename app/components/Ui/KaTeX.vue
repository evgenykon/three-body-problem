<script setup lang="ts">
import katex from 'katex'
import 'katex/dist/katex.min.css'

const props = withDefaults(defineProps<{
  expression: string
  displayMode?: boolean
}>(), {
  displayMode: false,
})

const rendered = katex.renderToString(props.expression, {
  displayMode: props.displayMode,
  throwOnError: false,
  trust: true,
})
</script>

<template>
  <span v-html="rendered" :class="{ 'katex-display': displayMode }" />
</template>

<style scoped>
:deep(.katex-display) {
  margin: 1em 0;
  overflow-x: auto;
  overflow-y: hidden;
}
</style>
