<script setup lang="ts">
import { ref, computed } from 'vue'

interface Option {
  value: string | number
  label: string
}

interface Props {
  modelValue?: string | number
  options: Option[]
  placeholder?: string
  disabled?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  disabled: false
})

const emit = defineEmits<{
  (e: 'update:modelValue', value: string | number): void
}>()

const isOpen = ref(false)

const selectedLabel = computed(() => {
  const option = props.options.find(o => o.value === props.modelValue)
  return option?.label || props.placeholder || 'Select...'
})

const select = (value: string | number) => {
  emit('update:modelValue', value)
  isOpen.value = false
}
</script>

<template>
  <div class="select" :class="{ 'select--open': isOpen, 'select--disabled': disabled }">
    <button
      type="button"
      class="select-trigger"
      :disabled="disabled"
      @click="!disabled && (isOpen = !isOpen)"
    >
      <span class="select-value">{{ selectedLabel }}</span>
      <span class="select-arrow">▼</span>
    </button>
    <div v-if="isOpen" class="select-dropdown">
      <button
        v-for="option in options"
        :key="option.value"
        type="button"
        class="select-option"
        :class="{ 'select-option--selected': option.value === modelValue }"
        @click="select(option.value)"
      >
        {{ option.label }}
      </button>
    </div>
  </div>
</template>

<style scoped>
.select {
  position: relative;
  display: inline-block;
  width: 100%;
}

.select-trigger {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  padding: 10px 12px;
  background: var(--background);
  border: 1px solid var(--border);
  border-radius: 6px;
  font-size: 14px;
  color: var(--foreground);
  cursor: pointer;
  transition: border-color 0.2s;
}

.select-trigger:hover:not(:disabled) {
  border-color: var(--muted-foreground);
}

.select-trigger:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.select-value {
  flex: 1;
  text-align: left;
}

.select-arrow {
  font-size: 10px;
  color: var(--muted-foreground);
  margin-left: 8px;
  transition: transform 0.2s;
}

.select--open .select-arrow {
  transform: rotate(180deg);
}

.select-dropdown {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  margin-top: 4px;
  background: var(--card);
  border: 1px solid var(--border);
  border-radius: 6px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.2);
  z-index: 100;
  overflow: hidden;
}

.select-option {
  display: block;
  width: 100%;
  padding: 10px 12px;
  background: transparent;
  border: none;
  font-size: 14px;
  color: var(--foreground);
  text-align: left;
  cursor: pointer;
}

.select-option:hover {
  background: var(--muted);
}

.select-option--selected {
  background: var(--primary);
  color: var(--primary-foreground);
}
</style>