<script setup lang="ts">
import { ref } from 'vue'

interface Tab {
  value: string
  label: string
  icon?: string
}

interface Props {
  tabs: Tab[]
  modelValue?: string
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: ''
})

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void
}>()

const activeTab = ref(props.modelValue || props.tabs[0]?.value)

const select = (value: string) => {
  activeTab.value = value
  emit('update:modelValue', value)
}
</script>

<template>
  <div class="tabs">
    <div class="tabs-list">
      <button
        v-for="tab in tabs"
        :key="tab.value"
        class="tabs-trigger"
        :class="{ 'tabs-trigger--active': activeTab === tab.value }"
        @click="select(tab.value)"
      >
        {{ tab.label }}
      </button>
    </div>
  </div>
</template>

<style scoped>
.tabs {
  width: 100%;
}

.tabs-list {
  display: flex;
  gap: 4px;
  border-bottom: 1px solid var(--border);
  padding-bottom: 0;
}

.tabs-trigger {
  padding: 10px 16px;
  background: transparent;
  border: none;
  font-size: 14px;
  font-weight: 500;
  color: var(--muted-foreground);
  cursor: pointer;
  border-bottom: 2px solid transparent;
  margin-bottom: -1px;
  transition: all 0.15s;
}

.tabs-trigger:hover {
  color: var(--foreground);
}

.tabs-trigger--active {
  color: var(--foreground);
  border-bottom-color: var(--primary);
}
</style>