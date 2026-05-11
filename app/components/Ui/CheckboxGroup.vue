<script setup lang="ts">
import { computed } from 'vue'

interface Option {
  value: string | number
  label: string
}

interface Props {
  modelValue?: (string | number)[]
  options: Option[]
  disabled?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: () => [],
  disabled: false
})

const emit = defineEmits<{
  (e: 'update:modelValue', value: (string | number)[]): void
}>()

const toggle = (value: string | number) => {
  if (props.disabled) return
  
  const newValue = [...props.modelValue]
  const index = newValue.indexOf(value)
  
  if (index > -1) {
    newValue.splice(index, 1)
  } else {
    newValue.push(value)
  }
  
  emit('update:modelValue', newValue)
}

const isChecked = (value: string | number) => {
  return props.modelValue.includes(value)
}
</script>

<template>
  <div class="checkbox-group">
    <label
      v-for="option in options"
      :key="option.value"
      class="checkbox-group-item"
      :class="{ 'checkbox-group-item--disabled': disabled }"
    >
      <input
        type="checkbox"
        :checked="isChecked(option.value)"
        :disabled="disabled"
        class="checkbox-input"
        @change="toggle(option.value)"
      >
      <span class="checkbox-box">
        <svg class="checkbox-check" viewBox="0 0 16 16" fill="none">
          <path d="M3 8l3 3 7-7" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </span>
      <span class="checkbox-label">{{ option.label }}</span>
    </label>
  </div>
</template>

<style scoped>
.checkbox-group {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.checkbox-group-item {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  user-select: none;
}

.checkbox-group-item--disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.checkbox-input {
  position: absolute;
  opacity: 0;
  width: 0;
  height: 0;
}

.checkbox-box {
  width: 18px;
  height: 18px;
  border: 2px solid var(--border);
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.15s;
  flex-shrink: 0;
}

.checkbox-input:checked + .checkbox-box {
  background: var(--primary);
  border-color: var(--primary);
}

.checkbox-check {
  width: 12px;
  height: 12px;
  color: var(--primary-foreground);
  opacity: 0;
  transform: scale(0.5);
  transition: all 0.15s;
}

.checkbox-input:checked + .checkbox-box .checkbox-check {
  opacity: 1;
  transform: scale(1);
}

.checkbox-label {
  font-size: 14px;
  color: var(--foreground);
}
</style>