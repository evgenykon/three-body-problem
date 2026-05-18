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

const leviCivitaExpr = '(u + iv)^2 = x + iy \\quad \\Longrightarrow \\quad x = u^2 - v^2,\\; y = 2uv'

const timeRegExpr = 'dt = r \\, ds \\quad \\Longrightarrow \\quad \\frac{d}{dt} = \\frac{1}{r}\\frac{d}{ds}'

const sundmanSeriesExpr = '\\mathbf{r}_i(s) = \\sum_{n=0}^\\infty \\mathbf{a}_n s^n, \\quad |s| < R'

const convergenceExpr = '|\\mathbf{a}_n| \\sim C \\cdot R^{-n} \\cdot n^\\alpha, \\quad R \\ll 1'

const freefallExpr = '\\ddot{x} = -\\frac{G(m_1 + m_2)}{x^2} = -\\frac{2Gm}{x^2}, \\quad x(0) = 20,\\; \\dot{x}(0) = 0'

const regularizedExpr = '\\frac{d^2 u}{ds^2} + \\frac{Gm}{2} u = 0'

const seriesExpr = 'x(s) = a_0 + a_2 s^2 + a_4 s^4 + \\cdots'

const presetBodies: BodyConfig[] = [
  { id: 'body1', position: { x: 0.97000436, y: -0.24308753 }, velocity: { x: 0.466203685, y: 0.43236573 }, mass: 1, radius: 0.05, color: '#ff6b6b' },
  { id: 'body2', position: { x: -0.97000436, y: 0.24308753 }, velocity: { x: 0.466203685, y: 0.43236573 }, mass: 1, radius: 0.05, color: '#4ecdc4' },
  { id: 'body3', position: { x: 0, y: 0 }, velocity: { x: -0.93240737, y: -0.86473146 }, mass: 1, radius: 0.05, color: '#45b7d1' },
]

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
    <article class="sundman-page">
      <UiHeader :level="1" class="page-title">{{ t('sundman.title') }}</UiHeader>

      <section class="content-section">
        <UiCard>
          <UiCardContent>
            <p class="lead-text">{{ t('sundman.intro') }}</p>
          </UiCardContent>
        </UiCard>
      </section>

      <section class="content-section">
        <UiHeader :level="2" class="section-title">{{ t('sundman.theoremTitle') }}</UiHeader>
        <UiCard>
          <UiCardContent>
            <p>{{ t('sundman.theoremText') }}</p>
          </UiCardContent>
        </UiCard>
      </section>

      <section class="content-section">
        <UiHeader :level="2" class="section-title">{{ t('sundman.regularizationTitle') }}</UiHeader>
        <UiCard>
          <UiCardContent>
            <p>{{ t('sundman.regularizationText') }}</p>

            <p>{{ t('sundman.regularizationEquationText') }}</p>
            <div class="equation-block">
              <UiKaTeX :expression="leviCivitaExpr" :display-mode="true" />
            </div>

            <p>{{ t('sundman.timeRegularizationText') }}</p>

            <p>{{ t('sundman.timeRegularizationEquationText') }}</p>
            <div class="equation-block">
              <UiKaTeX :expression="timeRegExpr" :display-mode="true" />
            </div>
          </UiCardContent>
        </UiCard>
      </section>

      <section class="content-section">
        <UiHeader :level="2" class="section-title">{{ t('sundman.analyticTitle') }}</UiHeader>
        <UiCard>
          <UiCardContent>
            <p>{{ t('sundman.analyticText') }}</p>
          </UiCardContent>
        </UiCard>
      </section>

      <section class="content-section">
        <UiHeader :level="2" class="section-title">{{ t('sundman.seriesTitle') }}</UiHeader>
        <UiCard>
          <UiCardContent>
            <p>{{ t('sundman.seriesText') }}</p>

            <p>{{ t('sundman.seriesEquationText') }}</p>
            <div class="equation-block">
              <UiKaTeX :expression="sundmanSeriesExpr" :display-mode="true" />
            </div>

            <p>{{ t('sundman.convergenceRateText') }}</p>
            <div class="equation-block">
              <UiKaTeX :expression="convergenceExpr" :display-mode="true" />
            </div>
          </UiCardContent>
        </UiCard>
      </section>

      <section class="content-section">
        <UiHeader :level="2" class="section-title">{{ t('sundman.catchTitle') }}</UiHeader>
        <UiCard>
          <UiCardContent>
            <p>{{ t('sundman.catchText') }}</p>
          </UiCardContent>
        </UiCard>
      </section>

      <section class="content-section">
        <UiHeader :level="2" class="section-title">{{ t('sundman.significanceTitle') }}</UiHeader>
        <UiCard>
          <UiCardContent>
            <p>{{ t('sundman.significanceText') }}</p>
          </UiCardContent>
        </UiCard>
      </section>

      <section class="content-section numerical-section">
        <UiHeader :level="2" class="section-title">{{ t('sundman.numericalTitle') }}</UiHeader>
        <UiCard>
          <UiCardContent>
            <p>{{ t('sundman.numericalText') }}</p>

            <p>{{ t('sundman.numericalEquationText') }}</p>
            <div class="equation-block">
              <UiKaTeX :expression="freefallExpr" :display-mode="true" />
            </div>

            <p>{{ t('sundman.numericalRegText') }}</p>
            <div class="equation-block">
              <UiKaTeX :expression="regularizedExpr" :display-mode="true" />
            </div>

            <p>{{ t('sundman.numericalRegText2') }}</p>

            <p>{{ t('sundman.numericalSeriesText') }}</p>
            <div class="equation-block">
              <UiKaTeX :expression="seriesExpr" :display-mode="true" />
            </div>
          </UiCardContent>
        </UiCard>
      </section>

      <section class="content-section simulation-section">
        <UiHeader :level="2" class="section-title">{{ t('sundman.simulationTitle') }}</UiHeader>
        <UiCard>
          <UiCardContent>
            <p>{{ t('sundman.simulationText') }}</p>
            <div class="sim-controls">
              <UiButton @click="toggleSimulation">
                {{ isRunning ? t('simulation.pause') : t('simulation.play') }}
              </UiButton>
              <UiButton variant="outline" @click="resetSimulation">{{ t('simulation.reset') }}</UiButton>
            </div>
            <div class="canvas-container">
              <ThreeBodySimulation
                ref="simRef"
                :bodies="presetBodies"
                :integration-method="integrationMethod"
                :gravitational-constant="1"
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
.sundman-page {
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
