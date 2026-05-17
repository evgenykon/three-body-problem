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
const integrationMethod = ref<IntegrationMethod>('euler')

const eulerEquation = '\\mathbf{y}_{n+1} = \\mathbf{y}_n + h \\cdot \\mathbf{f}(t_n, \\mathbf{y}_n)'

const forceExpr = 'F_{12} = G \\frac{m_1 m_2}{r_{12}^2} = 80 \\cdot \\frac{100 \\cdot 100}{20^2} = 2000'

const body1Accel = '\\begin{aligned} a_1 &= \\frac{F_{12}}{m_1} = \\frac{2000}{100} = 20 \\\\ \\mathbf{a}_1 &= (-20,\\; 0) \\end{aligned}'
const body1Vel = '\\begin{aligned} \\mathbf{v}_1(\\Delta t) &= \\mathbf{v}_1(0) + \\mathbf{a}_1 \\Delta t \\\\ &= (0,\\; 14.14) + (-20,\\; 0) \\cdot 0.016 \\\\ &= (-0.32,\\; 14.14) \\end{aligned}'
const body1Pos = '\\begin{aligned} \\mathbf{r}_1(\\Delta t) &= \\mathbf{r}_1(0) + \\mathbf{v}_1(0) \\Delta t \\\\ &= (10,\\; 0) + (0,\\; 14.14) \\cdot 0.016 \\\\ &= (10,\\; 0.226) \\end{aligned}'

const body2Accel = '\\begin{aligned} a_2 &= \\frac{F_{12}}{m_2} = \\frac{2000}{100} = 20 \\\\ \\mathbf{a}_2 &= (20,\\; 0) \\end{aligned}'
const body2Vel = '\\begin{aligned} \\mathbf{v}_2(\\Delta t) &= \\mathbf{v}_2(0) + \\mathbf{a}_2 \\Delta t \\\\ &= (0,\\; -14.14) + (20,\\; 0) \\cdot 0.016 \\\\ &= (0.32,\\; -14.14) \\end{aligned}'
const body2Pos = '\\begin{aligned} \\mathbf{r}_2(\\Delta t) &= \\mathbf{r}_2(0) + \\mathbf{v}_2(0) \\Delta t \\\\ &= (-10,\\; 0) + (0,\\; -14.14) \\cdot 0.016 \\\\ &= (-10,\\; -0.226) \\end{aligned}'

const body3Accel = '\\begin{aligned} |\\mathbf{a}_{31}| &= |\\mathbf{a}_{32}| = \\frac{G m_1}{r^2} = \\frac{80 \\cdot 100}{10^2 + 120^2} = 0.552 \\\\ a_{3x} &= 0.552 \\cdot \\frac{10}{\\sqrt{14500}} - 0.552 \\cdot \\frac{10}{\\sqrt{14500}} = 0 \\\\ a_{3y} &= -0.552 \\cdot \\frac{120}{\\sqrt{14500}} - 0.552 \\cdot \\frac{120}{\\sqrt{14500}} = -1.100 \\\\ \\mathbf{a}_3 &= (0,\\; -1.100) \\end{aligned}'
const body3Vel = '\\begin{aligned} \\mathbf{v}_3(\\Delta t) &= \\mathbf{v}_3(0) + \\mathbf{a}_3 \\Delta t \\\\ &= (-11.49,\\; 0) + (0,\\; -1.100) \\cdot 0.016 \\\\ &= (-11.49,\\; -0.0176) \\end{aligned}'
const body3Pos = '\\begin{aligned} \\mathbf{r}_3(\\Delta t) &= \\mathbf{r}_3(0) + \\mathbf{v}_3(0) \\Delta t \\\\ &= (0,\\; 120) + (-11.49,\\; 0) \\cdot 0.016 \\\\ &= (-0.184,\\; 120) \\end{aligned}'

const presetBodies: BodyConfig[] = [
  { id: 'body1', position: { x: 10, y: 0 }, velocity: { x: 0, y: 14.14 }, mass: 100, radius: 8, color: '#ff6b6b' },
  { id: 'body2', position: { x: -10, y: 0 }, velocity: { x: 0, y: -14.14 }, mass: 100, radius: 8, color: '#4ecdc4' },
  { id: 'body3', position: { x: 0, y: 120 }, velocity: { x: -11.49, y: 0 }, mass: 0.1, radius: 3, color: '#45b7d1' },
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
    <article class="euler-page">
      <UiHeader :level="1" class="page-title">{{ t('euler.title') }}</UiHeader>

      <section class="content-section">
        <UiCard>
          <UiCardContent>
            <p class="lead-text">{{ t('euler.intro') }}</p>
          </UiCardContent>
        </UiCard>
      </section>

      <section class="content-section">
        <UiHeader :level="2" class="section-title">{{ t('euler.restrictedTitle') }}</UiHeader>
        <UiCard>
          <UiCardContent>
            <p>{{ t('euler.restrictedText') }}</p>
          </UiCardContent>
        </UiCard>
      </section>

      <section class="content-section">
        <UiHeader :level="2" class="section-title">{{ t('euler.eulerMethodTitle') }}</UiHeader>
        <UiCard>
          <UiCardContent>
            <p>{{ t('euler.eulerMethodText') }}</p>
            <div class="equation-block">
              <UiKaTeX :expression="eulerEquation" :display-mode="true" />
            </div>
          </UiCardContent>
        </UiCard>
      </section>

      <section class="content-section">
        <UiHeader :level="2" class="section-title">{{ t('euler.significanceTitle') }}</UiHeader>
        <UiCard>
          <UiCardContent>
            <p>{{ t('euler.significanceText') }}</p>
          </UiCardContent>
        </UiCard>
      </section>

      <section class="content-section numerical-section">
        <UiHeader :level="2" class="section-title">{{ t('euler.numericalTitle') }}</UiHeader>
        <UiCard>
          <UiCardContent>
            <p>{{ t('euler.numericalText') }}</p>

            <p>{{ t('euler.numericalForceText') }}</p>
            <div class="equation-block">
              <UiKaTeX :expression="forceExpr" :display-mode="true" />
            </div>

            <p>{{ t('euler.numericalBody1Text') }}</p>
            <div class="equation-block">
              <UiKaTeX :expression="body1Accel" :display-mode="true" />
            </div>
            <div class="equation-block">
              <UiKaTeX :expression="body1Vel" :display-mode="true" />
            </div>
            <div class="equation-block">
              <UiKaTeX :expression="body1Pos" :display-mode="true" />
            </div>

            <p>{{ t('euler.numericalBody2Text') }}</p>
            <div class="equation-block">
              <UiKaTeX :expression="body2Accel" :display-mode="true" />
            </div>
            <div class="equation-block">
              <UiKaTeX :expression="body2Vel" :display-mode="true" />
            </div>
            <div class="equation-block">
              <UiKaTeX :expression="body2Pos" :display-mode="true" />
            </div>

            <p>{{ t('euler.numericalBody3Text') }}</p>
            <div class="equation-block">
              <UiKaTeX :expression="body3Accel" :display-mode="true" />
            </div>
            <div class="equation-block">
              <UiKaTeX :expression="body3Vel" :display-mode="true" />
            </div>
            <div class="equation-block">
              <UiKaTeX :expression="body3Pos" :display-mode="true" />
            </div>
          </UiCardContent>
        </UiCard>
      </section>

      <section class="content-section simulation-section">
        <UiHeader :level="2" class="section-title">{{ t('euler.simulationTitle') }}</UiHeader>
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
                :zoom="1"
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
.euler-page {
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
