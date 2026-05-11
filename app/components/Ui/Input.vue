<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  type?: string
  value?: string | number
  placeholder?: string
  disabled?: boolean
  id?: string
  name?: string
  required?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  type: 'text',
  disabled: false,
  required: false
})

const emit = defineEmits<{
  (e: 'update:value', value: string): void
  (e: 'input', event: Event): void
  (e: 'change', event: Event): void
}>()

const modelValue = computed({
  get() {
    return props.value
  },
  set(value: string) {
    emit('update:value', value)
  }
})

function handleInput(event: Event) {
  const target = event.target as HTMLInputElement
  modelValue.value = target.value
  emit('input', event)
}

function handleChange(event: Event) {
  emit('change', event)
}
</script>

<template>
  <input
    :id="id"
    :type="type"
    :value="modelValue"
    :placeholder="placeholder"
    :disabled="disabled"
    :name="name"
    :required="required"
    class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
    @input="handleInput"
    @change="handleChange"
  >
</template>