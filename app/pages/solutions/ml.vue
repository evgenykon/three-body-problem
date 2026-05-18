<script setup lang="ts">
import { ref } from 'vue'
import type { BodyConfig } from '~/components/ThreeBodySimulation.vue'

const { t } = useI18n()

definePageMeta({
  layout: 'default',
})

const simRef = ref<any>(null)
const isRunning = ref(false)

const mlEquation = '\\mathbf{r}_i(t+\\tau) = f_\\theta(\\mathbf{r}_1(t), \\mathbf{r}_2(t), \\mathbf{r}_3(t), \\mathbf{v}_1(t), \\mathbf{v}_2(t), \\mathbf{v}_3(t))'

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
    <article class="ml-page">
      <UiHeader :level="1" class="page-title">{{ t('ml.title') }}</UiHeader>

      <section class="content-section">
        <UiCard>
          <UiCardContent>
            <p class="lead-text">{{ t('ml.intro') }}</p>
          </UiCardContent>
        </UiCard>
      </section>

      <section class="content-section">
        <UiHeader :level="2" class="section-title">{{ t('ml.approachTitle') }}</UiHeader>
        <UiCard>
          <UiCardContent>
            <p>{{ t('ml.approachText') }}</p>
            <div class="equation-block">
              <UiKaTeX :expression="mlEquation" :display-mode="true" />
            </div>
          </UiCardContent>
        </UiCard>
      </section>

      <section class="content-section">
        <UiHeader :level="2" class="section-title">{{ t('ml.limitsTitle') }}</UiHeader>
        <UiCard>
          <UiCardContent>
            <p>{{ t('ml.limitsText') }}</p>
          </UiCardContent>
        </UiCard>
      </section>

      <section class="content-section simulation-section">
        <UiHeader :level="2" class="section-title">{{ t('ml.simulationTitle') }}</UiHeader>
        <UiCard>
          <UiCardContent>
            <p>{{ t('ml.simulationText') }}</p>
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
                integration-method="velocity-verlet"
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
.ml-page {
  padding: 24px 0;
  max-width: 800px;
  margin: 0 auto;
}
.page-title { margin: 0 0 24px; }
.content-section { margin-bottom: 24px; }
.section-title { margin: 0 0 12px; }
.lead-text { font-size: 15px; line-height: 1.7; color: var(--muted-foreground); margin: 0; }
.equation-block { display: flex; justify-content: center; padding: 16px 0; }
.simulation-section { margin-top: 32px; }
.sim-controls { display: flex; gap: 8px; align-items: center; margin-bottom: 12px; }
.canvas-container { width: 100%; aspect-ratio: 1; max-height: 500px; border-radius: 8px; overflow: hidden; }
.content-section p { margin: 0; line-height: 1.7; color: var(--muted-foreground); font-size: 14px; }
.content-section p + p { margin-top: 8px; }
</style>
