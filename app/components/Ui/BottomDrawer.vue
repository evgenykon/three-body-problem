<script setup lang="ts">
import { ref, watch } from 'vue'

interface Props {
  title?: string
}

withDefaults(defineProps<Props>(), {
  title: ''
})

const isOpen = ref(false)

const open = () => {
  isOpen.value = true
}

const close = () => {
  isOpen.value = false
}

defineExpose({
  open,
  close,
  isOpen
})
</script>

<template>
  <Teleport to="body">
    <Transition name="drawer">
      <div v-if="isOpen" class="drawer-overlay" @click.self="close">
        <div class="drawer">
          <div class="drawer-header">
            <UiHeader :level="3">{{ title }}</UiHeader>
            <UiButton variant="ghost" size="sm" @click="close">✕</UiButton>
          </div>
          <div class="drawer-content">
            <slot />
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.drawer-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 1000;
  display: flex;
  align-items: flex-end;
}

.drawer {
  width: 100%;
  max-height: 40vh;
  background: var(--card);
  border-top-left-radius: 16px;
  border-top-right-radius: 16px;
  border-top: 1px solid var(--border);
  overflow: hidden;
}

.drawer-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 4px 12px;
  border-bottom: 1px solid var(--border);
}

.drawer-header :deep(h3) {
  font-size: 16px;
  margin: 0;
}

.drawer-content {
  padding: 12px;
  overflow-y: auto;
  max-height: calc(60vh - 36px);
}

.drawer-enter-active,
.drawer-leave-active {
  transition: opacity 0.3s ease;
}

.drawer-enter-active .drawer,
.drawer-leave-active .drawer {
  transition: transform 0.3s ease;
}

.drawer-enter-from,
.drawer-leave-to {
  opacity: 0;
}

.drawer-enter-from .drawer,
.drawer-leave-to .drawer {
  transform: translateY(100%);
}
</style>