<script setup lang="ts">
import { ref } from 'vue'
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
const zoom = ref(2.5)

const distanceExpr = 'r_{31} = r_{32} = \\sqrt{10^2 + 80^2} = \\sqrt{6500} = 80.62'

const forceExpr = 'F_{31} = F_{32} = G\\frac{m^2}{r^2} = 80 \\cdot \\frac{100^2}{6500} = 123.08'

const netForceExpr = '\\mathbf{F}_3 = (0,\\; -2 \\cdot 123.08 \\cdot \\frac{80}{80.62}) = (0,\\; -244.28)'

const accelExpr = '\\mathbf{a}_3 = \\frac{\\mathbf{F}_3}{m_3} = \\frac{(0,\\; -244.28)}{100} = (0,\\; -2.44)'

const stepExpr = '\\begin{aligned} \\mathbf{v}_3(\\Delta t) &= (-11,\\; 0) + (0,\\; -2.44) \\cdot 0.016 = (-11,\\; -0.039) \\\\ \\mathbf{r}_3(\\Delta t) &= (0,\\; 80) + (-11,\\; 0) \\cdot 0.016 = (-0.176,\\; 80) \\end{aligned}'

const lagrangeBodies: BodyConfig[] = [
  { id: 'body1', position: { x: 80, y: 0 }, velocity: { x: 0, y: 10.75 }, mass: 200, radius: 14, color: '#ff6b6b' },
  { id: 'body2', position: { x: -40, y: 69.28 }, velocity: { x: -9.31, y: -5.37 }, mass: 200, radius: 14, color: '#4ecdc4' },
  { id: 'body3', position: { x: -40, y: -69.28 }, velocity: { x: 9.31, y: -5.37 }, mass: 200, radius: 14, color: '#45b7d1' },
]

const exampleBodies: BodyConfig[] = [
  { id: 'body1', position: { x: 10, y: 0 }, velocity: { x: 0, y: 14.14 }, mass: 100, radius: 8, color: '#ff6b6b' },
  { id: 'body2', position: { x: -10, y: 0 }, velocity: { x: 0, y: -14.14 }, mass: 100, radius: 8, color: '#4ecdc4' },
  { id: 'body3', position: { x: 0, y: 80 }, velocity: { x: -11, y: 0 }, mass: 100, radius: 8, color: '#45b7d1' },
]

const presetBodies = ref<BodyConfig[]>([...exampleBodies])

const loadPreset = (name: string) => {
  isRunning.value = false
  if (name === 'lagrange') {
    presetBodies.value = [...lagrangeBodies]
    zoom.value = 1.8
  } else if (name === 'example') {
    presetBodies.value = [...exampleBodies]
    zoom.value = 2.5
  } else if (name === 'unstable') {
    const randomX = (Math.random() - 0.5) * 200
    const vx = randomX >= 0 ? -11 : 11
    presetBodies.value = [
      { id: 'body1', position: { x: 10, y: 0 }, velocity: { x: 0, y: 14.14 }, mass: 100, radius: 8, color: '#ff6b6b' },
      { id: 'body2', position: { x: -10, y: 0 }, velocity: { x: 0, y: -14.14 }, mass: 100, radius: 8, color: '#4ecdc4' },
      { id: 'body3', position: { x: randomX, y: 80 }, velocity: { x: vx, y: 0 }, mass: 100, radius: 8, color: '#45b7d1' },
    ]
    zoom.value = 2.5
  }
  presetKey.value++
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
            <div class="preset-controls">
              <UiButton variant="outline" @click="loadPreset('lagrange')">{{ t('poincare.presetLagrange') }}</UiButton>
              <UiButton variant="outline" @click="loadPreset('example')">{{ t('poincare.presetExample') }}</UiButton>
              <UiButton variant="outline" @click="loadPreset('unstable')">{{ t('poincare.presetUnstable') }}</UiButton>
            </div>
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
                v-model:zoom="zoom"
                :auto-start="false"
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

.sim-controls {
  display: flex;
  gap: 8px;
  align-items: center;
  margin-bottom: 12px;
}

.preset-controls {
  display: flex;
  gap: 8px;
  align-items: center;
  margin-bottom: 12px;
  flex-wrap: wrap;
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
