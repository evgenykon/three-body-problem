<script setup lang="ts">
import { ref, watch } from 'vue'
import type { BodyConfig, PrecalculatedFrames } from '~/components/ThreeBodySimulation.vue'
import { fig8, butterfly1, bumblebee, moth1, moth2, moth3, goggles, dragonfly, yarn, yinyang1 } from '~/data/precalculated'

const { t } = useI18n()

definePageMeta({
  layout: 'default',
})

const simRef = ref<any>(null)
const isRunning = ref(false)
const presetKey = ref(0)
const gravitationalConstant = ref(1)
const validationResult = ref<string | null>(null)

interface PresetDef {
  bodies: BodyConfig[]
  G: number
  frames: PrecalculatedFrames
}

function suvakovBodies(vx: number, vy: number): BodyConfig[] {
  const r = 0.006
  return [
    { id: 'b1', position: { x: -1, y: 0 }, velocity: { x: vx, y: vy }, mass: 1, radius: r, color: '#ff6b6b' },
    { id: 'b2', position: { x: 1, y: 0 },  velocity: { x: vx, y: vy }, mass: 1, radius: r, color: '#4ecdc4' },
    { id: 'b3', position: { x: 0, y: 0 },  velocity: { x: -2 * vx, y: -2 * vy }, mass: 1, radius: r, color: '#45b7d1' },
  ]
}

const presets: Record<string, PresetDef> = {
  figure8: {
    bodies: [
      { id: 'b1', position: { x: 0.97000436, y: -0.24308753 }, velocity: { x: 0.466203685, y: 0.43236573 }, mass: 1, radius: 0.05, color: '#ff6b6b' },
      { id: 'b2', position: { x: -0.97000436, y: 0.24308753 }, velocity: { x: 0.466203685, y: 0.43236573 }, mass: 1, radius: 0.05, color: '#4ecdc4' },
      { id: 'b3', position: { x: 0, y: 0 }, velocity: { x: -0.93240737, y: -0.86473146 }, mass: 1, radius: 0.05, color: '#45b7d1' },
    ],
    G: 1, frames: fig8.frames,
  },
  butterfly1: { bodies: suvakovBodies(0.3068931165215643, 0.1255073111049974), G: 1, frames: butterfly1.frames },
  bumblebee: { bodies: suvakovBodies(0.18428, 0.58719), G: 1, frames: bumblebee.frames },
  moth1: { bodies: suvakovBodies(0.46444, 0.39606), G: 1, frames: moth1.frames },
  moth2: { bodies: suvakovBodies(0.43917, 0.45297), G: 1, frames: moth2.frames },
  moth3: { bodies: suvakovBodies(0.38344, 0.37736), G: 1, frames: moth3.frames },
  goggles: { bodies: suvakovBodies(0.08330, 0.12789), G: 1, frames: goggles.frames },
  dragonfly: { bodies: suvakovBodies(0.08058, 0.58884), G: 1, frames: dragonfly.frames },
  yarn: { bodies: suvakovBodies(0.55902, 0.34919), G: 1, frames: yarn.frames },
  yinyang1: { bodies: suvakovBodies(0.51394, 0.30474), G: 1, frames: yinyang1.frames },
}

const presetOptions = [
  { value: 'figure8', label: 'Figure-8' },
  { value: 'butterfly1', label: 'Butterfly I' },
  { value: 'bumblebee', label: 'Bumblebee' },
  { value: 'moth1', label: 'Moth I' },
  { value: 'moth2', label: 'Moth II' },
  { value: 'moth3', label: 'Moth III' },
  { value: 'goggles', label: 'Goggles' },
  { value: 'dragonfly', label: 'Dragonfly' },
  { value: 'yarn', label: 'Yarn' },
  { value: 'yinyang1', label: 'Yin-Yang I' },
]

const currentPreset = ref('figure8')
const presetBodies = ref<BodyConfig[]>([...presets.figure8!.bodies])
const precalculatedFrames = ref<PrecalculatedFrames>(presets.figure8!.frames)

const loadPreset = (name: string) => {
  const p = presets[name]
  if (!p) return
  isRunning.value = false
  presetBodies.value = p.bodies.map(b => ({ ...b }))
  gravitationalConstant.value = p.G
  precalculatedFrames.value = p.frames
  presetKey.value++
  validationResult.value = null
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

const validateCurrentOrbit = () => {
  if (!simRef.value) return
  const engine = simRef.value.getEngine()
  if (!engine) return
  const bodies = engine.getBodies()
  const cfg = engine.getConfig()
  let minDist = Infinity
  for (let i = 0; i < bodies.length; i++) {
    for (let j = i + 1; j < bodies.length; j++) {
      const d = Math.hypot(bodies[i].position.x - bodies[j].position.x, bodies[i].position.y - bodies[j].position.y)
      minDist = Math.min(minDist, d)
    }
  }
  const energy = engine.totalEnergy()
  const frameCount = simRef.value.frameCount ?? 0
  validationResult.value = `[Frame ${frameCount}] minDist: ${minDist.toFixed(6)} | energy: ${energy.toFixed(6)} | G=${cfg.gravitationalConstant}`
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
                integration-method="precalculated"
                :gravitational-constant="gravitationalConstant"
                :auto-start="false"
                :show-trails="true"
                :show-vectors="false"
                :show-predictions="false"
                :precalculated-frames="precalculatedFrames"
              />
            </div>
            <div class="sim-controls" style="margin-top: 8px;">
              <UiButton variant="ghost" size="sm" @click="validateCurrentOrbit">Validate orbit</UiButton>
            </div>
            <p v-if="validationResult" class="validation-result">{{ validationResult }}</p>
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
.validation-result { font-size: 11px; color: var(--muted-foreground); margin: 4px 0 8px; font-family: monospace; }
</style>
