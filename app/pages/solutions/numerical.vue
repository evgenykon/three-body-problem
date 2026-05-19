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
const zoom = ref(1.8)

watch(integrationMethod, () => {
  zoom.value = 1.8
})

const eulerEquation = '\\mathbf{v}(t+\\Delta t) = \\mathbf{v}(t) + \\mathbf{a}(t)\\Delta t, \\quad \\mathbf{r}(t+\\Delta t) = \\mathbf{r}(t) + \\mathbf{v}(t)\\Delta t'
const rk4Equation = '\\mathbf{r}(t+\\Delta t) = \\mathbf{r}(t) + \\frac{\\Delta t}{6}(\\mathbf{k}_1 + 2\\mathbf{k}_2 + 2\\mathbf{k}_3 + \\mathbf{k}_4)'
const verletEquation = '\\mathbf{r}(t+\\Delta t) = \\mathbf{r}(t) + \\mathbf{v}(t)\\Delta t + \\frac12\\mathbf{a}(t)\\Delta t^2, \\quad \\mathbf{v}(t+\\Delta t) = \\mathbf{v}(t) + \\frac12(\\mathbf{a}(t)+\\mathbf{a}(t+\\Delta t))\\Delta t'

const methodOptions = [
  { value: 'euler', label: t('simulation.methodEuler') },
  { value: 'rk4', label: t('simulation.methodRK4') },
  { value: 'velocity-verlet', label: t('simulation.methodVelocityVerlet') },
]

const v = Math.sqrt(5120 * 200 / (80 * Math.sqrt(3)))
const presetBodies: BodyConfig[] = [
  { id: 'body1', position: { x: 80, y: 0 }, velocity: { x: 0, y: v }, mass: 200, radius: 14, color: '#ff6b6b' },
  { id: 'body2', position: { x: -40, y: 40 * Math.sqrt(3) }, velocity: { x: -v * Math.sqrt(3) / 2, y: -v / 2 }, mass: 200, radius: 14, color: '#4ecdc4' },
  { id: 'body3', position: { x: -40, y: -40 * Math.sqrt(3) }, velocity: { x: v * Math.sqrt(3) / 2, y: -v / 2 }, mass: 200, radius: 14, color: '#45b7d1' },
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
    zoom.value = 1.8
  }
}
</script>

<template>
  <UiContainer>
    <article class="numerical-page">
      <UiHeader :level="1" class="page-title">{{ t('numerical.title') }}</UiHeader>

      <section class="content-section">
        <UiCard>
          <UiCardContent>
            <p class="lead-text">{{ t('numerical.intro') }}</p>
          </UiCardContent>
        </UiCard>
      </section>

      <section class="content-section">
        <UiHeader :level="2" class="section-title">{{ t('numerical.eulerTitle') }}</UiHeader>
        <UiCard>
          <UiCardContent>
            <p>{{ t('numerical.eulerText') }}</p>
            <div class="equation-block">
              <UiKaTeX :expression="eulerEquation" :display-mode="true" />
            </div>
          </UiCardContent>
        </UiCard>
      </section>

      <section class="content-section">
        <UiHeader :level="2" class="section-title">{{ t('numerical.rk4Title') }}</UiHeader>
        <UiCard>
          <UiCardContent>
            <p>{{ t('numerical.rk4Text') }}</p>
            <div class="equation-block">
              <UiKaTeX :expression="rk4Equation" :display-mode="true" />
            </div>
          </UiCardContent>
        </UiCard>
      </section>

      <section class="content-section">
        <UiHeader :level="2" class="section-title">{{ t('numerical.verletTitle') }}</UiHeader>
        <UiCard>
          <UiCardContent>
            <p>{{ t('numerical.verletText') }}</p>
            <div class="equation-block">
              <UiKaTeX :expression="verletEquation" :display-mode="true" />
            </div>
          </UiCardContent>
        </UiCard>
      </section>

      <section class="content-section">
        <UiHeader :level="2" class="section-title">{{ t('numerical.comparisonTitle') }}</UiHeader>
        <UiCard>
          <UiCardContent>
            <p>{{ t('numerical.comparisonText') }}</p>
          </UiCardContent>
        </UiCard>
      </section>
      <section class="content-section simulation-section">
        <UiHeader :level="2" class="section-title">{{ t('numerical.simulationTitle') }}</UiHeader>
        <UiCard>
          <UiCardContent>
            <p>{{ t('numerical.simulationText') }}</p>
            <div class="sim-controls">
              <UiButton @click="toggleSimulation">
                {{ isRunning ? t('simulation.pause') : t('simulation.play') }}
              </UiButton>
              <UiButton variant="outline" @click="resetSimulation">{{ t('simulation.reset') }}</UiButton>
              <UiSelect v-model="integrationMethod" :options="methodOptions" />
            </div>
            <div class="canvas-container">
              <ThreeBodySimulation
                ref="simRef"
                :key="integrationMethod"
                :bodies="presetBodies"
                :integration-method="integrationMethod"
                :gravitational-constant="5120"
                :softening="0.01"
                :time-step="0.001"
                :steps-per-frame="16"
                v-model:zoom="zoom"
                :auto-start="false"
                :show-predictions="false"
                :show-trails="true"
                :show-vectors="false"
                :show-frame-counter="true"
              />
            </div>
          </UiCardContent>
        </UiCard>
      </section>

      <section class="content-section">
        <UiCard>
          <UiCardContent>
            <p class="params-text">
              Нужно сказать пару слов про наш симулятор и проблематику отрисовки орбит: тут мы ищем компромисс между точностью и производительностью. За точность отвечают:
            </p>
            <ul class="params-list">
              <li><code>dt</code> — чем меньше, тем точнее</li>
              <li>метод интегрирования — Velocity-Verlet дает лучшее сохранение энергии, RK4 — баланс, Euler — самый грубый</li>
              <li><code>soft</code> — чем меньше, тем точнее гравитация на близких расстояниях</li>
            </ul>
            <p class="params-text">За производительность — <code>stepsPerFrame</code> (сколько шагов <code>dt</code> делается за один кадр) и сам <code>dt</code>: чем меньше шаг или чем больше шагов, тем выше нагрузка на процессор.
            </p>
            <p class="params-text">
              Ну и остаются <code>G</code> — задаёт силу гравитации, <code>zoom</code> — визуальный масштаб.
            </p>
            <p class="params-text">
              Таким образом, описываемые методы интегрирования на используемых в симуляторе настройках точности дают стабильность орбит примерно для 3000 кадров. Если увеличивать точность — можно получить зависание страницы (или, возможно, вы уже с ним столкнулись).
            </p>
          </UiCardContent>
        </UiCard>
      </section>
    </article>
  </UiContainer>
</template>

<style scoped>
.numerical-page {
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
.sim-controls { display: flex; gap: 8px; align-items: center; margin-bottom: 12px; flex-wrap: wrap; }
.canvas-container { width: 100%; aspect-ratio: 1; max-height: 500px; border-radius: 8px; overflow: hidden; }
.content-section p { margin: 0; line-height: 1.7; color: var(--muted-foreground); font-size: 14px; }
.content-section p + p { margin-top: 8px; }
.params-text { font-size: 13px; line-height: 1.8; color: var(--muted-foreground); margin: 0; }
.params-text code { font-size: 12px; padding: 1px 5px; background: var(--accent); border-radius: 3px; }
.params-list { margin: 4px 0 8px; padding-left: 20px; font-size: 13px; line-height: 1.8; color: var(--muted-foreground); }
.params-list code { font-size: 12px; padding: 1px 5px; background: var(--accent); border-radius: 3px; }
</style>
