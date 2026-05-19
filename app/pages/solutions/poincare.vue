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
const integrationMethod = ref<IntegrationMethod>('velocity-verlet')
const presetKey = ref(0)
const zoom = ref(3)
const gravitationalConstant = ref(80)
const currentPreset = ref('example')

const presetTabs = [
  { value: 'example', label: t('poincare.presetExample') },
  { value: 'lagrange', label: t('poincare.presetLagrange') },
  { value: 'unstable', label: 'Рандомные нестабильные орбиты' },
]

const distanceExpr = 'r = \\sqrt{20^2 + 34.5^2} \\approx 40'

const forceExpr = 'F_{31} = F_{32} = G\\frac{m^2}{r^2} = 80 \\cdot \\frac{100^2}{1600} = 500'

const netForceExpr = '\\mathbf{F}_3 = 2 \\cdot 500 \\cdot \\sin 60^\\circ \\approx 866 \\;\\text{(вверх)}'

const accelExpr = '\\mathbf{a}_3 = \\frac{866}{100} \\approx 8.66'

const stepExpr = '\\begin{aligned} \\mathbf{v}_3(\\Delta t) &= (7.78,\\; -12.25) + (0,\\; 8.66) \\cdot 0.016 \\approx (7.78,\\; -12.11) \\\\ \\mathbf{r}_3(\\Delta t) &= (-20,\\; -11.5) + (7.78,\\; -12.25) \\cdot 0.016 \\approx (-19.88,\\; -11.70) \\end{aligned}'

const lagrangeBodies: BodyConfig[] = [
  { id: 'body1', position: { x: 80, y: 0 }, velocity: { x: 0, y: 32.25 }, mass: 200, radius: 14, color: '#ff6b6b' },
  { id: 'body2', position: { x: -40, y: 69.28 }, velocity: { x: -27.93, y: -16.11 }, mass: 200, radius: 14, color: '#4ecdc4' },
  { id: 'body3', position: { x: -40, y: -69.28 }, velocity: { x: 27.93, y: -16.11 }, mass: 200, radius: 14, color: '#45b7d1' },
]

const exampleBodies: BodyConfig[] = [
  { id: 'body1', position: { x: 0, y: 23 }, velocity: { x: -14.14, y: 0 }, mass: 100, radius: 4, color: '#ff6b6b' },
  { id: 'body2', position: { x: 20, y: -11.5 }, velocity: { x: 7.07, y: 12.25 }, mass: 100, radius: 4, color: '#4ecdc4' },
  { id: 'body3', position: { x: -20, y: -11.5 }, velocity: { x: 7.78, y: -12.25 }, mass: 100, radius: 4, color: '#45b7d1' },
]

const presetBodies = ref<BodyConfig[]>([...exampleBodies])

const loadPreset = (name: string) => {
  isRunning.value = false
  if (name === 'lagrange') {
    presetBodies.value = [...lagrangeBodies]
    zoom.value = 1
    gravitationalConstant.value = 720
  } else if (name === 'example') {
    presetBodies.value = [...exampleBodies]
    zoom.value = 8
    gravitationalConstant.value = 80
  } else if (name === 'unstable') {
    const randomX = Math.random() * 40 - 20
    const vy = Math.random() * 10 - 5
    presetBodies.value = [
      { id: 'body1', position: { x: 10, y: 0 }, velocity: { x: 0, y: 14.14 }, mass: 100, radius: 3, color: '#ff6b6b' },
      { id: 'body2', position: { x: -10, y: 0 }, velocity: { x: 0, y: -14.14 }, mass: 100, radius: 3, color: '#4ecdc4' },
      { id: 'body3', position: { x: randomX, y: 50 + Math.random() * 30 }, velocity: { x: 0, y: vy }, mass: 20 + Math.random() * 40, radius: 2, color: '#45b7d1' },
    ]
    zoom.value = 3
    gravitationalConstant.value = 80
  }
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
    <article class="poincare-page">
      <UiHeader :level="1" class="page-title">{{ t('poincare.title') }}</UiHeader>

      <section class="content-section">
        <UiCard>
          <UiCardContent>
            <p class="lead-text">{{ t('poincare.intro') }}</p>
          </UiCardContent>
        </UiCard>
      </section>

      <section class="content-section">
        <UiHeader :level="2" class="section-title">{{ t('poincare.chaosTitle') }}</UiHeader>
        <UiCard>
          <UiCardContent>
            <p>{{ t('poincare.chaosText') }}</p>
          </UiCardContent>
        </UiCard>
      </section>

      <section class="content-section">
        <UiHeader :level="2" class="section-title">{{ t('poincare.significanceTitle') }}</UiHeader>
        <UiCard>
          <UiCardContent>
            <p>{{ t('poincare.significanceText') }}</p>
          </UiCardContent>
        </UiCard>
      </section>

      <section class="content-section numerical-section">
        <UiHeader :level="2" class="section-title">{{ t('poincare.numericalTitle') }}</UiHeader>
        <UiCard>
          <UiCardContent>
            <p>{{ t('poincare.numericalText') }}</p>

            <p>{{ t('poincare.numericalDistanceText') }}</p>
            <div class="equation-block">
              <UiKaTeX :expression="distanceExpr" :display-mode="true" />
            </div>

            <p>{{ t('poincare.numericalForceText') }}</p>
            <div class="equation-block">
              <UiKaTeX :expression="forceExpr" :display-mode="true" />
            </div>
            <div class="equation-block">
              <UiKaTeX :expression="netForceExpr" :display-mode="true" />
            </div>

            <p>{{ t('poincare.numericalAccelText') }}</p>
            <div class="equation-block">
              <UiKaTeX :expression="accelExpr" :display-mode="true" />
            </div>

            <p>{{ t('poincare.numericalStepText') }}</p>
            <div class="equation-block">
              <UiKaTeX :expression="stepExpr" :display-mode="true" />
            </div>
          </UiCardContent>
        </UiCard>
      </section>

      <section class="content-section simulation-section">
        <UiHeader :level="2" class="section-title">{{ t('poincare.simulationTitle') }}</UiHeader>
        <UiCard>
          <UiCardContent>
            <UiTabs v-model="currentPreset" :tabs="presetTabs" class="preset-tabs" />
            <div class="sim-controls">
              <UiButton @click="toggleSimulation">
                {{ isRunning ? t('simulation.pause') : t('simulation.play') }}
              </UiButton>
              <UiButton variant="outline" @click="resetSimulation">{{ t('simulation.reset') }}</UiButton>
            </div>
            <div class="canvas-container">
              <ThreeBodySimulation
                :key="presetKey"
                ref="simRef"
                :bodies="presetBodies"
                :integration-method="integrationMethod"
                :gravitational-constant="gravitationalConstant"
                v-model:zoom="zoom"
                :auto-start="false"
                :show-vectors="false"
                :show-trails="true"
                :trail-length="200"
                :show-predictions="false"
              />
            </div>
          </UiCardContent>
        </UiCard>
      </section>
    </article>
  </UiContainer>
</template>

<style scoped>
.poincare-page {
  padding: 24px 0;
  max-width: 800px;
  margin: 0 auto;
}

.page-title {
  margin: 0 0 24px;
}

.content-section {
  margin-bottom: 24px;
}

.section-title {
  margin: 0 0 12px;
}

.lead-text {
  font-size: 15px;
  line-height: 1.7;
  color: var(--muted-foreground);
  margin: 0;
}

.equation-block {
  display: flex;
  justify-content: center;
  padding: 16px 0;
}

.simulation-section {
  margin-top: 32px;
}

.preset-tabs {
  margin-bottom: 12px;
}

.sim-controls {
  display: flex;
  gap: 8px;
  align-items: center;
  margin-bottom: 12px;
}

.canvas-container {
  width: 100%;
  aspect-ratio: 1;
  max-height: 500px;
  border-radius: 8px;
  overflow: hidden;
}

.content-section p {
  margin: 0;
  line-height: 1.7;
  color: var(--muted-foreground);
  font-size: 14px;
}

.content-section p + p {
  margin-top: 8px;
}
</style>
