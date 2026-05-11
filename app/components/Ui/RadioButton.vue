<script setup lang="ts">
interface Props {
  modelValue?: string | number
  value?: string | number
  label?: string
  disabled?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  disabled: false
})

const emit = defineEmits<{
  (e: 'update:modelValue', value: string | number): void
}>()

const isChecked = () => {
  emit('update:modelValue', props.value!)
}
</script>

<template>
  <label class="radio" :class="{ 'radio--disabled': disabled }">
    <input
      type="radio"
      :checked="modelValue === value"
      :value="value"
      :disabled="disabled"
      class="radio-input"
      @change="isChecked"
    >
    <span class="radio-box">
      <span class="radio-dot" />
    </span>
    <span v-if="label" class="radio-label">{{ label }}</span>
  </label>
</template>

<style scoped>
.radio {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
  user-select: none;
  padding: 4px 0;
}

.radio--disabled {
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