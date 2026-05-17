<script setup lang="ts">
import { ref, watch, onMounted, nextTick } from 'vue'
import type { Body, IntegrationMethod } from '~/simulation/Engine'

const { t } = useI18n()

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
const eventLog = ref<string[]>([])
const selectedPreset = ref('triangle')
const gravityConstant = ref(80)
const integrationMethod = ref<IntegrationMethod>('euler')
const isLogOpen = ref(false)

const integrationMethods = [
  { value: 'euler', label: t('simulation.methodEuler') },
  { value: 'rk4', label: t('simulation.methodRK4') },
  { value: 'velocity-verlet', label: t('simulation.methodVelocityVerlet') }
]

const presets = [
  { value: 'figure-eight', label: t('simulation.presetFigureEight') },
  { value: 'triangle', label: t('simulation.presetTriangle') }
]

const presetBodies = {
  'figure-eight': [
    { id: 'body1', position: { x: 77.6, y: -19.45 }, velocity: { x: -6.59, y: -6.11 }, mass: 200, radius: 15, color: '#ff6b6b' },
    { id: 'body2', position: { x: -77.6, y: 19.45 }, velocity: { x: -6.59, y: -6.11 }, mass: 200, radius: 15, color: '#4ecdc4' },
    { id: 'body3', position: { x: 0, y: 0 }, velocity: { x: 13.18, y: 12.23 }, mass: 200, radius: 15, color: '#45b7d1' }
  ],
  'triangle': [
    { id: 'body1', position: { x: 80, y: 0 }, velocity: { x: 0, y: 10.75 }, mass: 200, radius: 15, color: '#ff6b6b' },
    { id: 'body2', position: { x: -40, y: 69.28 }, velocity: { x: -9.31, y: -5.37 }, mass: 200, radius: 15, color: '#4ecdc4' },
    { id: 'body3', position: { x: -40, y: -69.28 }, velocity: { x: 9.31, y: -5.37 }, mass: 200, radius: 15, color: '#45b7d1' }
  ],
}


const loadPreset = () => {
  const preset = presetBodies[selectedPreset.value as keyof typeof presetBodies]
  if (!preset || !simRef.value) return
  
  simRef.value.stop()
  isRunning.value = false
  simRef.value.setBodies(preset)
  frameCount.value = 0
  eventLog.value = []
  logEvent(`Preset: ${presets.find(p => p.value === selectedPreset.value)?.label}`)
}

const updateGravity = () => {
  const engine = simRef.value?.getEngine?.()
  if (engine) {
    engine.setConfig({ gravitationalConstant: gravityConstant.value })
    logEvent(`G changed to ${gravityConstant.value}`)
  }
}

const updateIntegrationMethod = () => {
  const engine = simRef.value?.getEngine?.()
  if (engine) {
    engine.setConfig({ integrationMethod: integrationMethod.value })
  }
}

const getEngineData = () => {
  const engine = simRef.value?.getEngine?.()
  if (!engine) return null
  const cfg = engine.getConfig()
  const ke = engine.kineticEnergy()
  const pe = engine.potentialEnergy()
  const etot = ke + pe
  const bodies = engine.getBodies().map((b: Body) =>
    `${b.id}(m=${b.mass} p=(${b.position.x.toFixed(1)},${b.position.y.toFixed(1)}) v=(${b.velocity.x.toFixed(2)},${b.velocity.y.toFixed(2)}))`
  ).join(' ')
  return { ke, pe, etot, bodies, G: cfg.gravitationalConstant, method: cfg.integrationMethod, dt: cfg.timeStep }
}

const logEvent = (msg: string) => {
  const data = getEngineData()
  if (data) {
    eventLog.value.push(`[${frameCount.value}][G=${data.G}][${data.method}][dt=${data.dt}] KE=${data.ke.toFixed(1)} PE=${data.pe.toFixed(1)} E=${data.etot.toFixed(1)} | ${msg} | ${data.bodies}`)
  } else {
    eventLog.value.push(`[${frameCount.value}] ${msg}`)
  }
}

const logEnergySnapshot = () => {
  if (!isRunning.value) return
  const data = getEngineData()
  if (data) {
    eventLog.value.push(`[${frameCount.value}][G=${data.G}][${data.method}] KE=${data.ke.toFixed(1)} PE=${data.pe.toFixed(1)} E=${data.etot.toFixed(1)} | ${data.bodies}`)
  }
}

let energyLogInterval: ReturnType<typeof setInterval> | null = null

onMounted(() => {
  setTimeout(() => {
    loadPreset()
  }, 100)
})

const syncFrameCount = () => {
  frameCount.value++
  if (isRunning.value) {
    requestAnimationFrame(syncFrameCount)
  }
}

watch(isRunning, (running) => {
  if (running) {
    syncFrameCount()
    energyLogInterval = setInterval(logEnergySnapshot, 8000)
  } else {
    if (energyLogInterval) {
      clearInterval(energyLogInterval)
      energyLogInterval = null
    }
  }
})

watch(integrationMethod, () => {
  updateIntegrationMethod()
  logEvent('Method changed')
})

watch(selectedPreset, () => {
  gravityConstant.value = 80
  integrationMethod.value = 'euler'
  loadPreset()
})

const logContentRef = ref<HTMLDivElement | null>(null)

watch(eventLog, () => {
  nextTick(() => {
    if (logContentRef.value) {
      logContentRef.value.scrollTop = logContentRef.value.scrollHeight
    }
  })
}, { flush: 'post' })

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
  mass: 200,
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

const onSimEnd = (reason: string) => {
  isRunning.value = false
  logEvent(reason)
}

const onSimStart = () => {
  logEvent('Simulation started')
}

const onSimCollision = (bodyA: Body, bodyB: Body) => {
  logEvent(`Collision: ${bodyA.id} + ${bodyB.id}`)
}

const onSimEjection = (body: Body) => {
  logEvent(`Ejection: ${body.id}`)
}

const resetSimulation = () => {
  if (simRef.value) {
    simRef.value.reset()
    frameCount.value = 0
    isRunning.value = false
    eventLog.value = []
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
  const body = engine.getBodies().find((b: Body) => b.id === bodyId)
  
  if (!body) return
  
  body.position.x = Number(editValues.value.x)
  body.position.y = Number(editValues.value.y)
  body.velocity.x = Number(editValues.value.vx)
  body.velocity.y = Number(editValues.value.vy)
  body.mass = Number(editValues.value.mass)
  body.radius = Number(editValues.value.radius)
  
  originalValues = { ...editValues.value }
  simRef.value?.updateInitialBodies()
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
  const body = engine.getBodies().find((b: Body) => b.id === selectedBody.value?.id)
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

const copyLog = () => {
  const text = eventLog.value.join('\n')
  navigator.clipboard.writeText(text).then(() => {
    eventLog.value.push(`[${frameCount.value}] ${t('simulation.copySuccess')}`)
  })
}
</script>

<template>
  <div class="page-content">
    <UiHeader :level="1" class="page-title">{{ t('simulation.title') }}</UiHeader>
    
<div class="flex gap-2 mb-2 items-center">
      <span class="text-sm">{{ t('simulation.g') }}</span>
      <input v-model.number="gravityConstant" class="input-field w-20" type="number" @change="updateGravity" />
      <UiSelect v-model="selectedPreset" :options="presets" class="w-40" />
      <span class="text-sm ml-2">{{ t('simulation.method') }}</span>
      <UiSelect v-model="integrationMethod" :options="integrationMethods" class="w-36" />
      <UiButton @click="toggleSimulation">
        {{ isRunning ? t('simulation.pause') : t('simulation.play') }}
      </UiButton>
      <UiButton variant="outline" @click="resetSimulation">{{ t('simulation.reset') }}</UiButton>
      <span class="flex-grow"></span>
      <UiButton variant="ghost" @click="zoomIn">Zoom In</UiButton>
      <UiButton variant="ghost" @click="zoomOut">Zoom Out</UiButton>
      <UiButton :variant="isLogOpen ? 'active' : 'ghost'" @click="isLogOpen = !isLogOpen">{{ t('simulation.log') }}</UiButton>
    </div>

    <div class="split-view">
      <div class="canvas-slot">
        <div class="canvas-wrapper">
          <div v-if="isRunning" class="frame-counter">{{ t('simulation.frame') }}: {{ frameCount }}</div>
          <UiThreeBodySimulation
            ref="simRef"
            :bodies="presetBodies[selectedPreset as keyof typeof presetBodies]"
            :integration-method="integrationMethod"
            :gravitational-constant="gravityConstant"
            :auto-start="false"
            @body-click="handleBodyClick"
            @start="onSimStart"
            @end="onSimEnd"
            @collision="onSimCollision"
            @ejection="onSimEjection"
          />
        </div>
      </div>
    </div>
    <div v-if="isLogOpen" class="event-log">
      <div class="event-log-header">
          <span class="event-log-title">{{ t('simulation.eventLog') }}</span>
          <UiButton variant="ghost" size="sm" class="copy-btn" @click="copyLog">{{ t('simulation.copy') }}</UiButton>
      </div>
      <div ref="logContentRef" class="event-log-content">
        <div v-for="(event, i) in eventLog" :key="i" class="event-item">{{ event }}</div>
      </div>
    </div>

    <UiLeftDrawer v-if="isDrawerOpen" :title="selectedBody?.id || t('simulation.bodyDetails')">
      <template #actions>
        <UiButton variant="ghost" size="sm" @click="closeDrawer">✕</UiButton>
      </template>
      <div class="drawer-content">
        <UiCard>
          <UiCardContent class="card-content">
            <div class="input-row">
              <div class="input-pair">
                <span class="label">{{ t('simulation.x') }}</span>
                <input v-model.number="editValues.x" class="input-field" type="number" step="0.1" />
              </div>
              <div class="input-pair">
                <span class="label">{{ t('simulation.y') }}</span>
                <input v-model.number="editValues.y" class="input-field" type="number" step="0.1" />
              </div>
              <UiButton 
                :variant="isPickingPosition ? 'active' : 'ghost'" 
                size="icon" 
                class="pick-btn"
                :title="isPickingPosition ? t('simulation.pickingPosition') : t('simulation.pickPosition')"
                @click="isPickingPosition ? cancelPickPosition() : startPickPosition()"
              >
                ⊕
              </UiButton>
            </div>
            <div class="input-row">
              <div class="input-pair">
                <span class="label">{{ t('simulation.vx') }}</span>
                <input v-model.number="editValues.vx" class="input-field" type="number" step="0.01" />
              </div>
              <div class="input-pair">
                <span class="label">{{ t('simulation.vy') }}</span>
                <input v-model.number="editValues.vy" class="input-field" type="number" step="0.01" />
              </div>
              <UiButton 
                :variant="isPickingVector ? 'active' : 'ghost'" 
                size="icon" 
                class="pick-btn"
                :title="isPickingVector ? '...' : t('simulation.pickVector')"
                @click="isPickingVector ? cancelPickVector() : startPickVector()"
              >
                ⊕
              </UiButton>
            </div>
            <div class="input-grid">
              <div class="input-item">
                <span class="label">{{ t('simulation.mass') }}</span>
                <input v-model.number="editValues.mass" class="input-field" type="number" />
              </div>
              <div class="input-item">
                <span class="label">{{ t('simulation.radius') }}</span>
                <input v-model.number="editValues.radius" class="input-field" type="number" />
              </div>
            </div>
          </UiCardContent>
        </UiCard>
        
        <div class="action-col">
          <UiButton @click="applyChanges">{{ t('simulation.apply') }}</UiButton>
          <UiButton variant="ghost" @click="closeDrawer">{{ t('simulation.close') }}</UiButton>
        </div>
      </div>
    </UiLeftDrawer>
  </div>
</template>

<style scoped>
.page-content {
  padding: 8px 8px 0 8px;
  height: calc(100vh - 4rem - 16px);
  display: flex;
  flex-direction: column;
  overflow: hidden;
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

.split-view {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
}

.canvas-slot {
  flex: 1;
  min-height: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}

.canvas-wrapper {
  width: 100%;
  max-height: 100%;
  aspect-ratio: 1;
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

.event-log {
  position: fixed;
  bottom: 0;
  left: 256px;
  right: 0;
  height: 50vh;
  background: var(--muted);
  border: 1px solid var(--border);
  font-family: monospace;
  font-size: 11px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  z-index: 50;
}

.event-log-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 4px 8px;
  border-bottom: 1px solid var(--border);
  flex-shrink: 0;
}

.event-log-title {
  font-size: 10px;
  color: var(--muted-foreground);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.event-log-content {
  padding: 4px 8px;
  overflow-y: auto;
  flex: 1;
}

.event-item {
  padding: 1px 0;
  color: var(--foreground);
  white-space: pre-wrap;
  word-break: break-all;
  line-height: 1.4;
}

.copy-btn {
  font-size: 10px !important;
  padding: 2px 6px !important;
  height: auto !important;
  min-height: 0 !important;
}
</style>