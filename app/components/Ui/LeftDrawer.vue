<script setup lang="ts">
interface Props {
  title?: string
}

const props = withDefaults(defineProps<Props>(), {
  title: ''
})
</script>

<template>
  <Teleport to="body">
    <Transition name="drawer">
      <div class="drawer">
        <div class="drawer-header">
          <UiHeader :level="3">{{ title }}</UiHeader>
          <slot name="actions" />
        </div>
        <div class="drawer-content">
          <slot />
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.drawer {
  position: fixed;
  left: 0;
  top: 4rem;
  height: calc(100vh - 4rem);
  width: 16rem;
  max-width: 90vw;
  background: var(--card);
  border-right: 1px solid var(--border);
  z-index: 1000;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.drawer-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 4px 12px;
  border-bottom: 1px solid var(--border);
  flex-shrink: 0;
}

.drawer-header :deep(h3) {
  font-size: 16px;
  margin: 0;
}

.drawer-content {
  padding: 12px;
  overflow-y: auto;
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.drawer-enter-active,
.drawer-leave-active {
  transition: transform 0.3s ease;
}

.drawer-enter-from,
.drawer-leave-to {
  transform: translateX(-100%);
}
</style>
