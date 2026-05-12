<script setup lang="ts">
import { ref, watch } from 'vue'
import type { Body } from '~/simulation/Engine'

definePageMeta({
  layout: 'default'
})

const simRef = ref<any>(null)
const isRunning = ref(false)
const frameCount = ref(0)
const isPickingPosition = ref(false)
const isPickingVector = ref(false)
const isDrawerOpen = ref(false)
const selectedBody = ref<Body | null>(null)
const allBodies = ref<Body[]>([])

const syncFrameCount = () => {
  frameCount.value++
  if (isRunning.value) {
    requestAnimationFrame(syncFrameCount)
  }
}

watch(isRunning, (running) => {
  if (running) {
    syncFrameCount()
  }
})

const editValues = ref({
  x: 0,
  y: 0,
  vx: 0,
  vy: 0,
  mass: 500,
  radius: 15
})

let originalValues = {
  x: 0,
  y: 0,
  vx: 0,
  vy: 0,
  mass: 500,
  radius: 15
}

const toggleSimulation = () => {
  if (!simRef.value) return
   
  if (isRunning.value) {
    simRef.value.stop()
    isRunning.value = false
  } else {
    simRef.value.start()
    isRunning.value = true
  }
}

const resetSimulation = () => {
  if (simRef.value) {
    simRef.value.reset()
    frameCount.value = 0
    isRunning.value = false
  }
}

const zoomIn = () => {
  simRef.value?.zoom(0.2)
}

const zoomOut = () => {
  simRef.value?.zoom(-0.2)
}

const handleBodyClick = (body: Body) => {
  selectedBody.value = body
  const engine = simRef.value?.getEngine?.()
  allBodies.value = engine ? engine.getBodies() : []
  editValues.value = {
    x: body.position.x,
    y: body.position.y,
    vx: body.velocity.x,
    vy: body.velocity.y,
    mass: body.mass,
    radius: body.radius
  }
  originalValues = { ...editValues.value }
  isDrawerOpen.value = true
}

const closeDrawer = () => {
  isPickingPosition.value = false
  isPickingVector.value = false
  simRef.value?.cancelPickingPosition()
  simRef.value?.cancelPickingVector()
  isDrawerOpen.value = false
  selectedBody.value = null
  simRef.value?.clearSelection()
}

const applyChanges = () => {
  const engine = simRef.value?.getEngine?.()
  if (!engine) return
  
  const bodyId = selectedBody.value?.id
  const body = engine.getBodies().find(b => b.id === bodyId)
  
  if (!body) return
  
  body.position.x = Number(editValues.value.x)
  body.position.y = Number(editValues.value.y)
  body.velocity.x = Number(editValues.value.vx)
  body.velocity.y = Number(editValues.value.vy)
  body.mass = Number(editValues.value.mass)
  body.radius = Number(editValues.value.radius)
  
  originalValues = { ...editValues.value }
  closeDrawer()
}

const startPickPosition = () => {
  isPickingVector.value = false
  simRef.value?.cancelPickingVector()
  isPickingPosition.value = true
  simRef.value?.startPickingPosition(
    (x: number, y: number) => {
      editValues.value.x = Math.round(x * 10) / 10
      editValues.value.y = Math.round(y * 10) / 10
      isPickingPosition.value = false
    },
    (x: number, y: number) => {
      editValues.value.x = Math.round(x * 10) / 10
      editValues.value.y = Math.round(y * 10) / 10
    }
  )
}

const cancelPickPosition = () => {
  isPickingPosition.value = false
  simRef.value?.cancelPickingPosition()
}

const startPickVector = () => {
  isPickingPosition.value = false
  simRef.value?.cancelPickingPosition()
  isPickingVector.value = true
  const engine = simRef.value?.getEngine?.()
  if (!engine) return
  const body = engine.getBodies().find(b => b.id === selectedBody.value?.id)
  if (!body) return
  const vScale = 6
  const multiplier = (simRef.value?.canvasScale || 1) * vScale
  simRef.value?.startPickingVector(
    body.position.x,
    body.position.y,
    (vx: number, vy: number) => {
      editValues.value.vx = Math.round((vx / multiplier) * 100) / 100
      editValues.value.vy = Math.round((vy / multiplier) * 100) / 100
      isPickingVector.value = false
    },
    (vx: number, vy: number) => {
      editValues.value.vx = Math.round((vx / multiplier) * 100) / 100
      editValues.value.vy = Math.round((vy / multiplier) * 100) / 100
    }
  )
}

const cancelPickVector = () => {
  isPickingVector.value = false
  simRef.value?.cancelPickingVector()
}
</script>

<template>
  <div class="page-content">
    <UiHeader :level="1" class="page-title">2D Simple Simulation</UiHeader>
    
    <div class="flex gap-2 mb-2">
      <UiButton @click="toggleSimulation">
        {{ isRunning ? 'Pause' : 'Play' }}
      </UiButton>
      <UiButton variant="outline" @click="resetSimulation">Reset</UiButton>
      <UiButton variant="ghost" @click="zoomIn">Zoom In</UiButton>
      <UiButton variant="ghost" @click="zoomOut">Zoom Out</UiButton>
    </div>

    <div class="canvas-container">
      <div v-if="isRunning" class="frame-counter">Frame: {{ frameCount }}</div>
      <UiSimulationCanvas 
        ref="simRef" 
        :auto-start="false"
        @body-click="handleBodyClick"
        @stop="isRunning = false"
      />
    </div>

    <UiLeftDrawer v-if="isDrawerOpen" :title="selectedBody?.id || 'Body Details'">
      <template #actions>
        <UiButton variant="ghost" size="sm" @click="closeDrawer">✕</UiButton>
      </template>
      <div class="drawer-content">
        <UiCard>
          <UiCardContent class="card-content">
            <div class="input-row">
              <div class="input-pair">
                <span class="label">X</span>
                <input v-model.number="editValues.x" class="input-field" type="number" step="0.1" />
              </div>
              <div class="input-pair">
                <span class="label">Y</span>
                <input v-model.number="editValues.y" class="input-field" type="number" step="0.1" />
              </div>
              <UiButton 
                :variant="isPickingPosition ? 'active' : 'ghost'" 
                size="icon" 
                class="pick-btn"
                :title="isPickingPosition ? 'Picking position...' : 'Pick Position'"
                @click="isPickingPosition ? cancelPickPosition() : startPickPosition()"
              >
                ⊕
              </UiButton>
            </div>
            <div class="input-row">
              <div class="input-pair">
                <span class="label">VX</span>
                <input v-model.number="editValues.vx" class="input-field" type="number" step="0.01" />
              </div>
              <div class="input-pair">
                <span class="label">VY</span>
                <input v-model.number="editValues.vy" class="input-field" type="number" step="0.01" />
              </div>
              <UiButton 
                :variant="isPickingVector ? 'active' : 'ghost'" 
                size="icon" 
                class="pick-btn"
                :title="isPickingVector ? 'Picking vector...' : 'Pick Vector'"
                @click="isPickingVector ? cancelPickVector() : startPickVector()"
              >
                ⊕
              </UiButton>
            </div>
            <div class="input-grid">
              <div class="input-item">
                <span class="label">Mass</span>
                <input v-model.number="editValues.mass" class="input-field" type="number" />
              </div>
              <div class="input-item">
                <span class="label">Radius</span>
                <input v-model.number="editValues.radius" class="input-field" type="number" />
              </div>
            </div>
          </UiCardContent>
        </UiCard>
        
        <div class="action-col">
          <UiButton @click="applyChanges">Apply</UiButton>
          <UiButton variant="ghost" @click="closeDrawer">Close</UiButton>
        </div>
      </div>
    </UiLeftDrawer>
  </div>
</template>

<style scoped>
.page-content {
  padding: 8px 8px 0 8px;
}

.page-title {
  margin: 0;
}

.drawer-content {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.action-col {
  display: flex;
  flex-direction: row;
  gap: 8px;
}

.card-content {
  padding: 12px !important;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.input-row {
  display: flex;
  flex-direction: row;
  gap: 8px;
  align-items: flex-end;
}

.input-pair {
  display: flex;
  flex-direction: column;
  gap: 2px;
  flex: 1;
}

.pick-btn {
  font-size: 18px;
  line-height: 1;
  width: 32px;
  height: 32px;
  margin-bottom: 0;
}

.input-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
}

.input-item {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.input-item .label {
  font-size: 10px;
  color: var(--muted-foreground);
}

.input-field {
  padding: 4px 6px;
  font-size: 11px;
  font-family: monospace;
  background: var(--background);
  border: 1px solid var(--border);
  border-radius: 4px;
  color: var(--foreground);
  width: 100%;
}

.canvas-container {
  position: relative;
  width: 100%;
  height: calc(100vh - 300px);
  background: #0a0a0a;
  border-radius: 8px;
  overflow: hidden;
}

.frame-counter {
  position: absolute;
  top: 12px;
  right: 12px;
  padding: 4px 8px;
  background: rgba(0, 0, 0, 0.7);
  color: #fff;
  font-family: monospace;
  font-size: 12px;
  border-radius: 4px;
  z-index: 10;
}
</style>