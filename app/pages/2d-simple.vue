<script setup lang="ts">
import { ref } from 'vue'
import type { Body } from '~/simulation/Engine'

definePageMeta({
  layout: 'default'
})

const simRef = ref<any>(null)
const isRunning = ref(false)

const drawerRef = ref<any>(null)
const selectedBody = ref<Body | null>(null)
const allBodies = ref<Body[]>([])

const editValues = ref({
  x: 0,
  y: 0,
  vx: 0,
  vy: 0,
  mass: 500,
  radius: 15
})

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
    isRunning.value = true
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
  const eng = simRef.value?.engine
  const engine = eng?.value
  allBodies.value = engine ? engine.getBodies() : []
  editValues.value = {
    x: body.position.x,
    y: body.position.y,
    vx: body.velocity.x,
    vy: body.velocity.y,
    mass: body.mass,
    radius: body.radius
  }
  drawerRef.value?.open()
}

const applyChanges = () => {
  if (!simRef.value) return
  
  const eng = simRef.value.engine
  const engine = eng?.value
  if (!engine) return
  
  const bodies = engine.getBodies()
  const body = bodies.find(b => b.id === selectedBody.value?.id)
  if (body) {
    body.position.x = editValues.value.x
    body.position.y = editValues.value.y
    body.velocity.x = editValues.value.vx
    body.velocity.y = editValues.value.vy
    body.mass = editValues.value.mass
    body.radius = editValues.value.radius
    
    selectedBody.value = { ...body, position: { ...body.position }, velocity: { ...body.velocity } }
    allBodies.value = [...engine.getBodies()]
    
    simRef.value.draw()
  }
}
</script>

<template>
  <UiContainer>
    <UiHeader :level="1" class="mb-4">2D Simple Simulation</UiHeader>
    
    <div class="flex gap-2 mb-4">
      <UiButton @click="toggleSimulation">
        {{ isRunning ? 'Pause' : 'Play' }}
      </UiButton>
      <UiButton variant="outline" @click="resetSimulation">Reset</UiButton>
      <UiButton variant="ghost" @click="zoomIn">Zoom In</UiButton>
      <UiButton variant="ghost" @click="zoomOut">Zoom Out</UiButton>
    </div>

    <UiCard>
      <UiCardContent class="p-0">
        <UiSimulationCanvas 
          ref="simRef" 
          :auto-start="false"
          @body-click="handleBodyClick"
        />
      </UiCardContent>
    </UiCard>

    <UiBottomDrawer ref="drawerRef" :title="selectedBody?.id || 'Body Details'">
      <div v-if="selectedBody" class="drawer-content">
        <div class="cards-row">

          <UiCard class="info-card">
            <UiCardContent class="card-content">
              <div class="section-title">Current Values</div>
              <div class="info-grid">
                <div class="info-item">
                  <span class="label">X</span>
                  <span class="value">{{ selectedBody.position.x.toFixed(1) }}</span>
                </div>
                <div class="info-item">
                  <span class="label">Y</span>
                  <span class="value">{{ selectedBody.position.y.toFixed(1) }}</span>
                </div>
                <div class="info-item">
                  <span class="label">VX</span>
                  <span class="value">{{ selectedBody.velocity.x.toFixed(2) }}</span>
                </div>
                <div class="info-item">
                  <span class="label">VY</span>
                  <span class="value">{{ selectedBody.velocity.y.toFixed(2) }}</span>
                </div>
                <div class="info-item">
                  <span class="label">M</span>
                  <span class="value">{{ selectedBody.mass }}</span>
                </div>
                <div class="info-item">
                  <span class="label">R</span>
                  <span class="value">{{ selectedBody.radius }}</span>
                </div>
              </div>
            </UiCardContent>
          </UiCard>
          
          <UiCard class="input-card">
            <UiCardContent class="card-content">
              <div class="section-title">Set Values</div>
              <div class="input-grid">
                <div class="input-item">
                  <span class="label">X</span>
                  <input v-model.number="editValues.x" class="input-field" type="number" step="0.1" />
                </div>
                <div class="input-item">
                  <span class="label">Y</span>
                  <input v-model.number="editValues.y" class="input-field" type="number" step="0.1" />
                </div>
                <div class="input-item">
                  <span class="label">VX</span>
                  <input v-model.number="editValues.vx" class="input-field" type="number" step="0.01" />
                </div>
                <div class="input-item">
                  <span class="label">VY</span>
                  <input v-model.number="editValues.vy" class="input-field" type="number" step="0.01" />
                </div>
                <div class="input-item">
                  <span class="label">M</span>
                  <input v-model.number="editValues.mass" class="input-field" type="number" />
                </div>
                <div class="input-item">
                  <span class="label">R</span>
                  <input v-model.number="editValues.radius" class="input-field" type="number" />
                </div>
              </div>
            </UiCardContent>
          </UiCard>
          
          <div class="action-col">
            <UiButton class="action-btn" @click="applyChanges">Apply</UiButton>
            <UiButton variant="outline" @click="drawerRef?.close()">Close</UiButton>
          </div>
        </div>

      </div>
    </UiBottomDrawer>
  </UiContainer>
</template>

<style scoped>
.cards-row {
  display: grid;
  grid-template-columns: 1fr 1fr 80px;
  gap: 12px;
  align-items: start;
}

.info-card, .input-card {
  margin: 0;
}

.action-col {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding-top: 28px;
}

.card-content {
  padding: 12px !important;
}

.section-title {
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  color: var(--muted-foreground);
  margin-bottom: 8px;
}

.info-grid, .input-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
}

.info-item, .input-item {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.info-item .label, .input-item .label {
  font-size: 10px;
  color: var(--muted-foreground);
}

.info-item .value {
  font-family: monospace;
  font-size: 12px;
  color: var(--foreground);
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

.controls-row {
  margin-top: 12px;
}
.full-btn {
  width: 100%;
}
</style>