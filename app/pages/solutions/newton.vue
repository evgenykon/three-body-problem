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
const gravityConstant = ref(80)
const integrationMethod = ref<IntegrationMethod>('euler')

const lawEquation = 'F = G \\frac{m_1 m_2}{r^2}'
const motionEquation = 'm_i \\frac{d^2 \\mathbf{r}_i}{dt^2} = \\sum_{j \\neq i} G \\frac{m_i m_j}{|\\mathbf{r}_j - \\mathbf{r}_i|^3} (\\mathbf{r}_j - \\mathbf{r}_i)'

const presetBodies: BodyConfig[] = [
  { id: 'body1', position: { x: 80, y: 0 }, velocity: { x: 0, y: 10.75 }, mass: 200, radius: 15, color: '#ff6b6b' },
  { id: 'body2', position: { x: -40, y: 69.28 }, velocity: { x: -9.31, y: -5.37 }, mass: 200, radius: 15, color: '#4ecdc4' },
  { id: 'body3', position: { x: -40, y: -69.28 }, velocity: { x: 9.31, y: -5.37 }, mass: 200, radius: 15, color: '#45b7d1' },
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

      <section class="content-section simulation-section">
        <UiHeader :level="2" class="section-title">{{ t('newton.simulationTitle') }}</UiHeader>
        <UiCard>
          <UiCardContent>
            <p class="simulation-text">{{ t('newton.simulationText') }}</p>
            <div class="sim-controls">
              <label class="control-label">
                <span>G:</span>
                <input v-model.number="gravityConstant" class="input-field" type="number" />
              </label>
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
                :gravitational-constant="gravityConstant"
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

.control-label {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  color: var(--foreground);
}

.input-field {
  padding: 4px 6px;
  font-size: 12px;
  font-family: monospace;
  background: var(--background);
  border: 1px solid var(--border);
  border-radius: 4px;
  color: var(--foreground);
  width: 64px;
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
