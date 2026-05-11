<script setup lang="ts">
interface Props {
  pre?: string
  post?: string
  preIcon?: string
  postIcon?: string
}

defineProps<Props>()
</script>

<template>
  <div class="input-group">
    <span v-if="pre" class="input-group-pre">{{ pre }}</span>
    <span v-if="preIcon" class="input-group-icon input-group-pre">
      {{ preIcon }}
    </span>
    <div class="input-wrapper">
      <slot />
    </div>
    <span v-if="post" class="input-group-post">{{ post }}</span>
    <span v-if="postIcon" class="input-group-icon input-group-post">
      {{ postIcon }}
    </span>
  </div>
</template>

<style scoped>
.input-group {
  display: flex;
  align-items: stretch;
  width: 100%;
}

.input-group-pre,
.input-group-post {
  display: flex;
  align-items: center;
  padding: 0 12px;
  background: var(--muted);
  border: 1px solid var(--border);
  color: var(--muted-foreground);
  font-size: 14px;
  white-space: nowrap;
}

.input-group-pre {
  border-right: none;
  border-radius: 6px 0 0 6px;
}

.input-group-post {
  border-left: none;
  border-radius: 0 6px 6px 0;
}

.input-group-icon {
  font-size: 16px;
  width: 40px;
  justify-content: center;
}

.input-wrapper {
  flex: 1;
  display: flex;
}

.input-wrapper :deep(input) {
  border-radius: 0;
  width: 100%;
}

.input-group-pre + .input-wrapper :deep(input) {
  border-top-left-radius: 0;
  border-bottom-left-radius: 0;
}

.input-group-post + .input-wrapper :deep(input) {
  border-top-right-radius: 0;
  border-bottom-right-radius: 0;
}

.input-group:has(.input-group-pre) :deep(input) {
  border-top-left-radius: 0;
  border-bottom-left-radius: 0;
}

.input-group:has(.input-group-post) :deep(input) {
  border-top-right-radius: 0;
  border-bottom-right-radius: 0;
}
</style>