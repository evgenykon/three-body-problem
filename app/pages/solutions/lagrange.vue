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
const integrationMethod = ref<IntegrationMethod>('velocity-verlet')

const omegaExpr = '\\omega = \\sqrt{\\frac{G(m_1 + m_2)}{a^3}} = \\sqrt{\\frac{80 \\cdot 510}{60^3}} = \\sqrt{0.1889} \\approx 0.435'

const l4Expr = '\\begin{aligned} L_4 &= \\left(\\frac{x_1 + x_2}{2},\\; a\\frac{\\sqrt{3}}{2}\\right) = (28.82,\\; 51.96) \\\\ \\mathbf{v}_{L_4} &= \\boldsymbol{\\omega} \\times \\mathbf{r}_{L_4} = (-22.58,\\; 12.53) \\end{aligned}'

const stabilityExpr = '\\mu = \\frac{m_2}{m_1 + m_2} = \\frac{10}{510} \\approx 0.02 < 0.0385'

const presetBodies: BodyConfig[] = [
  { id: 'primary', position: { x: -1.18, y: 0 }, velocity: { x: 0, y: -0.511 }, mass: 500, radius: 18, color: '#ff6b6b' },
  { id: 'secondary', position: { x: 58.82, y: 0 }, velocity: { x: 0, y: 25.57 }, mass: 10, radius: 6, color: '#4ecdc4' },
  { id: 'l4', position: { x: 28.82, y: 51.96 }, velocity: { x: -22.58, y: 12.53 }, mass: 0.1, radius: 3, color: '#45b7d1' },
  { id: 'l5', position: { x: 28.82, y: -51.96 }, velocity: { x: 22.58, y: 12.53 }, mass: 0.1, radius: 3, color: '#f9ca24' },
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
    <article class="lagrange-page">
      <UiHeader :level="1" class="page-title">{{ t('lagrange.title') }}</UiHeader>

      <section class="content-section">
        <UiCard>
          <UiCardContent>
            <p class="lead-text">{{ t('lagrange.intro') }}</p>
          </UiCardContent>
        </UiCard>
      </section>

      <section class="content-section">
        <UiHeader :level="2" class="section-title">{{ t('lagrange.conceptTitle') }}</UiHeader>
        <UiCard>
          <UiCardContent>
            <p>{{ t('lagrange.conceptText') }}</p>
          </UiCardContent>
        </UiCard>
      </section>

      <section class="content-section">
        <UiHeader :level="2" class="section-title">{{ t('lagrange.collinearTitle') }}</UiHeader>
        <UiCard>
          <UiCardContent>
            <p>{{ t('lagrange.collinearText') }}</p>
          </UiCardContent>
        </UiCard>
      </section>

      <section class="content-section">
        <UiHeader :level="2" class="section-title">{{ t('lagrange.triangularTitle') }}</UiHeader>
        <UiCard>
          <UiCardContent>
            <p>{{ t('lagrange.triangularText') }}</p>
            <div class="equation-block">
              <UiKaTeX :expression="stabilityExpr" :display-mode="true" />
            </div>
          </UiCardContent>
        </UiCard>
      </section>

      <section class="content-section">
        <UiHeader :level="2" class="section-title">{{ t('lagrange.significanceTitle') }}</UiHeader>
        <UiCard>
          <UiCardContent>
            <p>{{ t('lagrange.significanceText') }}</p>
          </UiCardContent>
        </UiCard>
      </section>

      <section class="content-section numerical-section">
        <UiHeader :level="2" class="section-title">{{ t('lagrange.numericalTitle') }}</UiHeader>
        <UiCard>
          <UiCardContent>
            <p>{{ t('lagrange.numericalText') }}</p>
            <div class="equation-block">
              <UiKaTeX :expression="omegaExpr" :display-mode="true" />
            </div>

            <p>{{ t('lagrange.numericalL4Text') }}</p>
            <div class="equation-block">
              <UiKaTeX :expression="l4Expr" :display-mode="true" />
            </div>
          </UiCardContent>
        </UiCard>
      </section>

      <section class="content-section simulation-section">
        <UiHeader :level="2" class="section-title">{{ t('lagrange.simulationTitle') }}</UiHeader>
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
                :bodies="presetBodies"
                :integration-method="integrationMethod"
                :zoom="2.2"
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
.lagrange-page {
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
