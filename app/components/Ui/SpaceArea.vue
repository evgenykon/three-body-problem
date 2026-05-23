<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'

interface Props {
  width?: number | string
  height?: number | string
  background?: string
}

const props = withDefaults(defineProps<Props>(), {
  width: '100%',
  height: '100%',
  background: '#0a0a0a'
})

const containerRef = ref<HTMLDivElement | null>(null)
const canvasRef = ref<HTMLCanvasElement | null>(null)

const emit = defineEmits<{
  (e: 'ready', ctx: CanvasRenderingContext2D, width: number, height: number): void
}>()

onMounted(() => {
  if (canvasRef.value && containerRef.value) {
    const ctx = canvasRef.value.getContext('2d')
    if (ctx) {
      const rect = containerRef.value.getBoundingClientRect()
      canvasRef.value.width = rect.width
      canvasRef.value.height = rect.height
      emit('ready', ctx, rect.width, rect.height)
    }
  }
})

const getContainerStyle = () => {
  const style: Record<string, string> = {
    position: 'relative',
    width: typeof props.width === 'number' ? `${props.width}px` : props.width,
    height: typeof props.height === 'number' ? `${props.height}px` : props.height,
    overflow: 'hidden',
  }
  if (props.background) {
    style.background = props.background
  }
  return style
}
</script>

<template>
  <div ref="containerRef" class="space-area" :style="getContainerStyle()">
    <canvas ref="canvasRef" class="space-canvas" />
    <div class="space-overlay">
      <slot />
    </div>
  </div>
</template>

<style scoped>
.space-area {
  border-radius: 8px;
  border: 1px solid var(--border);
}

.space-canvas {
  display: block;
  width: 100%;
  height: 100%;
}

.space-overlay {
  position: absolute;
  inset: 0;
  pointer-events: none;
}

.space-overlay :deep(*) {
  pointer-events: auto;
}
</style>