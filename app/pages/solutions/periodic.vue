<script setup lang="ts">
import { ref, watch } from 'vue'
import type { IntegrationMethod } from '~/simulation/Engine'
import type { BodyConfig } from '~/components/ThreeBodySimulation.vue'

const { t } = useI18n()

definePageMeta({
  layout: 'default',
})

const simRef = ref<any>(null)
const isRunning = ref(false)
const integrationMethod = ref<IntegrationMethod>('precalculated')
const gravitationalConstant = ref(1)
const softening = ref(0)
const timeStep = ref(0.016)
const stepsPerFrame = ref(1)
const trailLength = ref(100)
const presetKey = ref(0)
const zoom = ref<number | undefined>(undefined)
const showTrails = ref(true)
const showVectors = ref(true)
const showPredictions = ref(true)

const methodOptions = [
  { value: 'precalculated', label: t('simulation.methodPrecalculated') },
  { value: 'euler', label: t('simulation.methodEuler') },
  { value: 'rk4', label: t('simulation.methodRK4') },
  { value: 'velocity-verlet', label: t('simulation.methodVelocityVerlet') },
]

interface PresetDef {
  bodies: BodyConfig[]
  G: number
  zoom?: number
  softening: number
  dt: number
  steps: number
  trailLength: number
}

function makeSuvakovBody(vx: number, vy: number): BodyConfig[] {
  const r = 0.05
  return [
    { id: 'body1', position: { x: -1, y: 0 }, velocity: { x: vx, y: vy }, mass: 1, radius: r, color: '#ff6b6b' },
    { id: 'body2', position: { x: 1, y: 0 }, velocity: { x: vx, y: vy }, mass: 1, radius: r, color: '#4ecdc4' },
    { id: 'body3', position: { x: 0, y: 0 }, velocity: { x: -2 * vx, y: -2 * vy }, mass: 1, radius: r, color: '#45b7d1' },
  ]
}

const presets: Record<string, PresetDef> = {
  figure8: {
    bodies: [
      { id: 'body1', position: { x: 0.97000436, y: -0.24308753 }, velocity: { x: 0.466203685, y: 0.43236573 }, mass: 1, radius: 0.05, color: '#ff6b6b' },
      { id: 'body2', position: { x: -0.97000436, y: 0.24308753 }, velocity: { x: 0.466203685, y: 0.43236573 }, mass: 1, radius: 0.05, color: '#4ecdc4' },
      { id: 'body3', position: { x: 0, y: 0 }, velocity: { x: -0.93240737, y: -0.86473146 }, mass: 1, radius: 0.05, color: '#45b7d1' },
    ],
    G: 80, softening: 5, zoom: 121, dt: 0.0001, steps: 1, trailLength: 30,
  },
  lagrange: {
    bodies: [
      { id: 'body1', position: { x: 80, y: 0 }, velocity: { x: 0, y: 10.75 }, mass: 200, radius: 14, color: '#ff6b6b' },
      { id: 'body2', position: { x: -40, y: 69.28 }, velocity: { x: -9.31, y: -5.37 }, mass: 200, radius: 14, color: '#4ecdc4' },
      { id: 'body3', position: { x: -40, y: -69.28 }, velocity: { x: 9.31, y: -5.37 }, mass: 200, radius: 14, color: '#45b7d1' },
    ],
    G: 80, softening: 5, zoom: 121, dt: 0.016, steps: 1, trailLength: 30,
  },
  euler: {
    bodies: [
      { id: 'body1', position: { x: -40, y: 0 }, velocity: { x: 0, y: 22.36 }, mass: 200, radius: 10, color: '#ff6b6b' },
      { id: 'body2', position: { x: 0, y: 0 }, velocity: { x: 0, y: 0 }, mass: 200, radius: 10, color: '#4ecdc4' },
      { id: 'body3', position: { x: 40, y: 0 }, velocity: { x: 0, y: -22.36 }, mass: 200, radius: 10, color: '#45b7d1' },
    ],
    G: 80, softening: 5, zoom: 121, dt: 0.016, steps: 1, trailLength: 30,
  },
}
const presetOptions = [
  { value: 'figure8', label: t('periodic.figure8Title') },
  { value: 'lagrange', label: t('periodic.lagrangeTitle') },
  { value: 'euler', label: 'Эйлер коллинеарный' },
]

const currentPreset = ref('figure8')
const presetBodies = ref<BodyConfig[]>([...presets.figure8.bodies])

const loadPreset = (name: string) => {
  const p = presets[name]
  if (!p) return
  isRunning.value = false
  presetBodies.value = [...p.bodies]
  gravitationalConstant.value = p.G
  softening.value = p.softening
  timeStep.value = p.dt
  stepsPerFrame.value = p.steps
  trailLength.value = p.trailLength
  zoom.value = p.zoom
  presetKey.value++
}

watch(integrationMethod, () => {
  isRunning.value = false
  presetKey.value++
})

watch(currentPreset, (name) => {
  loadPreset(name)
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
    isRunning.value = false
  }
}
</script>

<template>
  <UiContainer>
    <article class="periodic-page">
      <UiHeader :level="1" class="page-title">{{ t('periodic.title') }}</UiHeader>

      <section class="content-section">
        <UiCard>
          <UiCardContent>
            <p class="lead-text">{{ t('periodic.intro') }}</p>
          </UiCardContent>
        </UiCard>
      </section>

      <section class="content-section">
        <UiHeader :level="2" class="section-title">{{ t('periodic.lagrangeTitle') }}</UiHeader>
        <UiCard>
          <UiCardContent>
            <p>{{ t('periodic.lagrangeText') }}</p>
          </UiCardContent>
        </UiCard>
      </section>

      <section class="content-section">
        <UiHeader :level="2" class="section-title">{{ t('periodic.zeroMomentumTitle') }}</UiHeader>
        <UiCard>
          <UiCardContent>
            <p>{{ t('periodic.zeroMomentumText') }}</p>
          </UiCardContent>
        </UiCard>
      </section>

      <section class="content-section">
        <UiHeader :level="3" class="section-title">{{ t('periodic.figure8Title') }}</UiHeader>
        <UiCard>
          <UiCardContent>
            <p>{{ t('periodic.figure8Text') }}</p>
          </UiCardContent>
        </UiCard>
      </section>

      <section class="content-section">
        <UiHeader :level="2" class="section-title">{{ t('periodic.suvakovTitle') }}</UiHeader>
        <UiCard>
          <UiCardContent>
            <p>{{ t('periodic.suvakovText') }}</p>
            <ul>
              <li>{{ t('periodic.butterflyText') }}</li>
              <li>{{ t('periodic.dragonflyText') }}</li>
              <li>{{ t('periodic.mothText') }}</li>
              <li>{{ t('periodic.gogglesText') }}</li>
              <li>{{ t('periodic.yinYangText') }}</li>
              <li>{{ t('periodic.bumblebeeText') }}</li>
              <li>{{ t('periodic.yarnText') }}</li>
            </ul>
          </UiCardContent>
        </UiCard>
      </section>

      <section class="content-section">
        <UiHeader :level="2" class="section-title">{{ t('periodic.hierarchicalTitle') }}</UiHeader>
        <UiCard>
          <UiCardContent>
            <p>{{ t('periodic.hierarchicalText') }}</p>
          </UiCardContent>
        </UiCard>
      </section>

      <section class="content-section">
        <UiHeader :level="2" class="section-title">{{ t('periodic.restrictedTitle') }}</UiHeader>
        <UiCard>
          <UiCardContent>
            <p>{{ t('periodic.restrictedText') }}</p>
          </UiCardContent>
        </UiCard>
      </section>

      <section class="content-section">
        <UiHeader :level="3" class="section-title">{{ t('periodic.lyapunovTitle') }}</UiHeader>
        <UiCard>
          <UiCardContent>
            <p>{{ t('periodic.lyapunovText') }}</p>
          </UiCardContent>
        </UiCard>
      </section>

      <section class="content-section">
        <UiHeader :level="3" class="section-title">{{ t('periodic.haloTitle') }}</UiHeader>
        <UiCard>
          <UiCardContent>
            <p>{{ t('periodic.haloText') }}</p>
          </UiCardContent>
        </UiCard>
      </section>

      <section class="content-section">
        <UiHeader :level="3" class="section-title">{{ t('periodic.lissajousTitle') }}</UiHeader>
        <UiCard>
          <UiCardContent>
            <p>{{ t('periodic.lissajousText') }}</p>
          </UiCardContent>
        </UiCard>
      </section>

      <section class="content-section simulation-section">
        <UiHeader :level="2" class="section-title">{{ t('periodic.simulationTitle') }}</UiHeader>
        <UiCard>
          <UiCardContent>
            <p>{{ t('periodic.simulationText') }}</p>
            <div class="sim-controls">
              <UiButton @click="toggleSimulation">
                {{ isRunning ? t('simulation.pause') : t('simulation.play') }}
              </UiButton>
              <UiButton variant="outline" @click="resetSimulation">{{ t('simulation.reset') }}</UiButton>
              <UiSelect v-model="currentPreset" :options="presetOptions" />
              <UiSelect v-model="integrationMethod" :options="methodOptions" />
              <span class="input-group">
                <span class="text-sm">soft</span>
                <input v-model.number="softening" class="input-field w-16" type="number" step="0.1" />
              </span>
              <span class="input-group">
                <span class="text-sm">dt</span>
                <input v-model.number="timeStep" class="input-field w-20" type="number" step="0.0001" />
              </span>
              <span class="input-group">
                <span class="text-sm">steps</span>
                <input v-model.number="stepsPerFrame" class="input-field w-16" type="number" step="1" min="1" />
              </span>
              <span class="input-group">
                <span class="text-sm">trail</span>
                <input v-model.number="trailLength" class="input-field w-20" type="number" step="100" min="10" />
              </span>
            </div>
            <div class="zoom-controls">
              <UiButton variant="outline" @click="simRef?.zoom(0.5)">Zoom+</UiButton>
              <UiButton variant="outline" @click="simRef?.zoom(-0.5)">Zoom-</UiButton>
              <input :value="simRef?.scale?.toFixed(2)" class="input-field w-16" readonly />
            </div>
            <div class="checkbox-controls">
              <UiCheckbox v-model="showVectors" label="Vectors" />
              <UiCheckbox v-model="showPredictions" label="Prediction" />
              <UiCheckbox v-model="showTrails" label="Trails" />
            </div>
            <div class="canvas-container">
              <ThreeBodySimulation
                :key="presetKey"
                ref="simRef"
                :bodies="presetBodies"
                :integration-method="integrationMethod"
                :gravitational-constant="gravitationalConstant"
                :zoom="zoom"
                :auto-start="false"
                :show-frame-counter="true"
                :softening="softening"
                :time-step="timeStep"
                :steps-per-frame="stepsPerFrame"
                :trail-length="trailLength"
                :show-trails="showTrails"
                :show-vectors="showVectors"
                :show-predictions="showPredictions"
              />
            </div>
          </UiCardContent>
        </UiCard>
      </section>
    </article>
  </UiContainer>
</template>

<style scoped>
.periodic-page {
  padding: 24px 0;
  max-width: 800px;
  margin: 0 auto;
}
.page-title { margin: 0 0 24px; }
.content-section { margin-bottom: 24px; }
.section-title { margin: 0 0 12px; }
.lead-text { font-size: 15px; line-height: 1.7; color: var(--muted-foreground); margin: 0; }
.simulation-section { margin-top: 32px; }
.sim-controls { display: flex; gap: 8px; align-items: center; margin-bottom: 12px; flex-wrap: wrap; }
.checkbox-controls { display: flex; gap: 16px; align-items: center; margin-bottom: 12px; }
.canvas-container { width: 100%; aspect-ratio: 1; max-height: 500px; border-radius: 8px; overflow: hidden; }
.content-section p { margin: 0; line-height: 1.7; color: var(--muted-foreground); font-size: 14px; }
.content-section p + p { margin-top: 8px; }
.content-section ul { margin: 8px 0 0; padding-left: 20px; line-height: 1.7; color: var(--muted-foreground); font-size: 14px; }
.content-section li { margin-bottom: 4px; }
.w-16 { width: 4rem; }
.input-group { display: inline-flex; align-items: center; gap: 4px; }
.zoom-controls { display: flex; gap: 8px; align-items: center; margin-bottom: 12px; }
</style>
