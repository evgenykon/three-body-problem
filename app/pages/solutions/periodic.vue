<script setup lang="ts">
import { ref, watch } from 'vue'
import type { IntegrationMethod } from '~/simulation/Engine'
import type { BodyConfig, PrecalculatedFrames } from '~/components/ThreeBodySimulation.vue'
import { fig8, lagrange } from '~/data/precalculated'

const { t } = useI18n()

definePageMeta({
  layout: 'default',
})

const simRef = ref<any>(null)
const isRunning = ref(false)
const integrationMethod = ref<IntegrationMethod>('precalculated')
const gravitationalConstant = ref(1)
const presetKey = ref(0)
const zoom = ref<number | undefined>(undefined)

interface PresetDef {
  bodies: BodyConfig[]
  G: number
  zoom?: number
  frames: PrecalculatedFrames
}

const v = Math.sqrt(5120 * 200 / (80 * Math.sqrt(3)))

const presets: Record<string, PresetDef> = {
  figure8: {
    bodies: [
      { id: 'b1', position: { x: 9.700044, y: -2.430875 }, velocity: { x: 4.662037, y: 4.323657 }, mass: 1, radius: 0.5, color: '#ff6b6b' },
      { id: 'b2', position: { x: -9.700044, y: 2.430875 }, velocity: { x: 4.662037, y: 4.323657 }, mass: 1, radius: 0.5, color: '#4ecdc4' },
      { id: 'b3', position: { x: 0, y: 0 }, velocity: { x: -9.324074, y: -8.647315 }, mass: 1, radius: 0.5, color: '#45b7d1' },
    ],
    G: 1000,
    zoom: 12,
    frames: fig8.frames,
  },
  lagrange: {
    bodies: [
      { id: 'b1', position: { x: 80, y: 0 }, velocity: { x: 0, y: v }, mass: 200, radius: 14, color: '#ff6b6b' },
      { id: 'b2', position: { x: -40, y: 40 * Math.sqrt(3) }, velocity: { x: -v * Math.sqrt(3) / 2, y: -v / 2 }, mass: 200, radius: 14, color: '#4ecdc4' },
      { id: 'b3', position: { x: -40, y: -40 * Math.sqrt(3) }, velocity: { x: v * Math.sqrt(3) / 2, y: -v / 2 }, mass: 200, radius: 14, color: '#45b7d1' },
    ],
    G: 5120,
    frames: lagrange.frames,
  },
}
const presetOptions = [
  { value: 'figure8', label: t('periodic.figure8Title') },
  { value: 'lagrange', label: t('periodic.lagrangeTitle') },
]

const currentPreset = ref('figure8')
const presetBodies = ref<BodyConfig[]>([...presets.figure8!.bodies])
const precalculatedFrames = ref<PrecalculatedFrames>(presets.figure8!.frames)

const loadPreset = (name: string) => {
  const p = presets[name]
  if (!p) return
  isRunning.value = false
  presetBodies.value = [...p.bodies]
  gravitationalConstant.value = p.G
  zoom.value = p.zoom
  precalculatedFrames.value = p.frames
  presetKey.value++
}

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
                :show-trails="true"
                :show-vectors="false"
                :show-predictions="false"
                :precalculated-frames="precalculatedFrames"
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
.canvas-container { width: 100%; aspect-ratio: 1; max-height: 500px; border-radius: 8px; overflow: hidden; }
.content-section p { margin: 0; line-height: 1.7; color: var(--muted-foreground); font-size: 14px; }
.content-section p + p { margin-top: 8px; }
.content-section ul { margin: 8px 0 0; padding-left: 20px; line-height: 1.7; color: var(--muted-foreground); font-size: 14px; }
.content-section li { margin-bottom: 4px; }
</style>
