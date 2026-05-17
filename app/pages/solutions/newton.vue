<script setup lang="ts">
import { ref } from 'vue'
import type { IntegrationMethod } from '~/simulation/Engine'
import type { BodyConfig } from '~/components/Ui/ThreeBodySimulation.vue'

const { t } = useI18n()

definePageMeta({
  layout: 'default',
})

const simRef = ref<any>(null)
const isRunning = ref(false)
const integrationMethod = ref<IntegrationMethod>('newton')

const lawEquation = 'F = G \\frac{m_1 m_2}{r^2}'
const motionEquation = 'm_i \\frac{d^2 \\mathbf{r}_i}{dt^2} = \\sum_{j \\neq i} G \\frac{m_i m_j}{|\\mathbf{r}_j - \\mathbf{r}_i|^3} (\\mathbf{r}_j - \\mathbf{r}_i)'

const presetBodies: BodyConfig[] = [
  { id: 'body1', position: { x: 40, y: 0 }, velocity: { x: 0, y: 10 }, mass: 200, radius: 14, color: '#ff6b6b' },
  { id: 'body2', position: { x: -40, y: 0 }, velocity: { x: 0, y: -10 }, mass: 200, radius: 14, color: '#4ecdc4' },
]

const numForceExpr = 'F = G \\frac{m_1 m_2}{r^2} = 80 \\cdot \\frac{200 \\cdot 200}{80^2} = 500'

const numKeplerExpr = '\\begin{aligned} T^2 &= \\frac{4\\pi^2 a^3}{G(m_1 + m_2)} = \\frac{4\\pi^2 \\cdot 80^3}{80 \\cdot 400} = 64\\pi^2 \\\\ T &= 8\\pi \\approx 25.13 \\end{aligned}'

const numVelocityExpr = 'v = \\frac{2\\pi a_1}{T} = \\frac{2\\pi \\cdot 40}{8\\pi} = 10'

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
    <article class="newton-page">
      <UiHeader :level="1" class="page-title">{{ t('newton.title') }}</UiHeader>

      <section class="content-section">
        <UiCard>
          <UiCardContent>
            <p class="lead-text">{{ t('newton.intro') }}</p>
          </UiCardContent>
        </UiCard>
      </section>

      <section class="content-section">
        <UiHeader :level="2" class="section-title">{{ t('newton.lawTitle') }}</UiHeader>
        <UiCard>
          <UiCardContent>
            <p>{{ t('newton.lawText') }}</p>
            <div class="equation-block">
              <UiKaTeX :expression="lawEquation" :display-mode="true" />
            </div>
            <p>{{ t('newton.lawDetail') }}</p>
          </UiCardContent>
        </UiCard>
      </section>

      <section class="content-section">
        <UiHeader :level="2" class="section-title">{{ t('newton.equationsTitle') }}</UiHeader>
        <UiCard>
          <UiCardContent>
            <p>{{ t('newton.equationsText') }}</p>
            <div class="equation-block">
              <UiKaTeX :expression="motionEquation" :display-mode="true" />
            </div>
            <p>{{ t('newton.equationsDetail') }}</p>
          </UiCardContent>
        </UiCard>
      </section>

      <section class="content-section">
        <UiHeader :level="2" class="section-title">{{ t('newton.systemTitle') }}</UiHeader>
        <UiCard>
          <UiCardContent>
            <p>{{ t('newton.systemText') }}</p>
          </UiCardContent>
        </UiCard>
      </section>

      <section class="content-section numerical-section">
        <UiHeader :level="2" class="section-title">{{ t('newton.numericalTitle') }}</UiHeader>
        <UiCard>
          <UiCardContent>
            <p>{{ t('newton.numericalText') }}</p>

            <p>{{ t('newton.numericalForceText') }}</p>
            <div class="equation-block">
              <UiKaTeX :expression="numForceExpr" :display-mode="true" />
            </div>

            <p>{{ t('newton.numericalKeplerText') }}</p>
            <div class="equation-block">
              <UiKaTeX :expression="numKeplerExpr" :display-mode="true" />
            </div>

            <p>{{ t('newton.numericalVelocityText') }}</p>
            <div class="equation-block">
              <UiKaTeX :expression="numVelocityExpr" :display-mode="true" />
            </div>
          </UiCardContent>
        </UiCard>
      </section>

      <section class="content-section simulation-section">
        <UiHeader :level="2" class="section-title">{{ t('newton.simulationTitle') }}</UiHeader>
        <UiCard>
          <UiCardContent>
            <div class="sim-controls">
              <UiButton @click="toggleSimulation">
                {{ isRunning ? t('simulation.pause') : t('simulation.play') }}
              </UiButton>
              <UiButton variant="outline" @click="resetSimulation">{{ t('simulation.reset') }}</UiButton>
            </div>
            <div class="canvas-container">
              <UiThreeBodySimulation
                ref="simRef"
                :zoom="2"
                :bodies="presetBodies"
                :integration-method="integrationMethod"
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
.newton-page {
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
  overflow-x: auto;
}

.simulation-section {
  margin-top: 32px;
}

.simulation-text {
  margin: 0 0 16px;
  color: var(--muted-foreground);
  font-size: 14px;
  line-height: 1.6;
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
