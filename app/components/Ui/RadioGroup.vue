<script setup lang="ts">
interface Option {
  value: string | number
  label: string
}

interface Props {
  modelValue?: string | number
  options: Option[]
  disabled?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  disabled: false
})

const emit = defineEmits<{
  (e: 'update:modelValue', value: string | number): void
}>()

const select = (value: string | number) => {
  if (!props.disabled) {
    emit('update:modelValue', value)
  }
}
</script>

<template>
  <div class="radio-group">
    <label
      v-for="option in options"
      :key="option.value"
      class="radio-group-item"
      :class="{ 'radio-group-item--disabled': disabled }"
    >
      <input
        type="radio"
        :checked="modelValue === option.value"
        :value="option.value"
        :disabled="disabled"
        class="radio-input"
        @change="select(option.value)"
      >
      <span class="radio-box">
        <span class="radio-dot" />
      </span>
      <span class="radio-label">{{ option.label }}</span>
    </label>
  </div>
</template>

<style scoped>
.radio-group {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.radio-group-item {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  user-select: none;
}

.radio-group-item--disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.radio-input {
  position: absolute;
  opacity: 0;
  width: 0;
  height: 0;
}

.radio-box {
  width: 18px;
  height: 18px;
  border: 2px solid var(--border);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.15s;
  flex-shrink: 0;
}

.radio-input:checked + .radio-box {
  border-color: var(--primary);
}

.radio-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: var(--primary);
  opacity: 0;
  transform: scale(0);
  transition: all 0.15s;
}

.radio-input:checked + .radio-box .radio-dot {
  opacity: 1;
  transform: scale(1);
}

.radio-label {
  font-size: 14px;
  color: var(--foreground);
}
</style>