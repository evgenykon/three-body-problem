<script setup lang="ts">
import { ref, watch } from 'vue'

definePageMeta({
  layout: 'default'
})

const name = ref('')
const email = ref('')
const password = ref('')
const country = ref('')
const countries = [
  { value: 'us', label: 'United States' },
  { value: 'uk', label: 'United Kingdom' },
  { value: 'ca', label: 'Canada' },
  { value: 'au', label: 'Australia' },
  { value: 'de', label: 'Germany' },
]

const checkboxValue = ref(false)
const checkboxGroup = ref<string[]>([])
const checkboxOptions = [
  { value: 'apple', label: 'Apple' },
  { value: 'banana', label: 'Banana' },
  { value: 'orange', label: 'Orange' },
]

const radioValue = ref('apple')
const radioOptions = [
  { value: 'apple', label: 'Apple' },
  { value: 'banana', label: 'Banana' },
  { value: 'orange', label: 'Orange' },
]

const price = ref('')

const activeTab = ref('general')
const tabs = [
  { value: 'general', label: 'General' },
  { value: 'security', label: 'Security' },
  { value: 'notifications', label: 'Notifications' },
  { value: 'advanced', label: 'Advanced' },
]

const demoPresets = {
  figureEight: [
    { id: 'b1', position: { x: 77.6, y: -19.45 }, velocity: { x: -6.59, y: -6.11 }, mass: 200, radius: 15, color: '#ff6b6b' },
    { id: 'b2', position: { x: -77.6, y: 19.45 }, velocity: { x: -6.59, y: -6.11 }, mass: 200, radius: 15, color: '#4ecdc4' },
    { id: 'b3', position: { x: 0, y: 0 }, velocity: { x: 13.18, y: 12.23 }, mass: 200, radius: 15, color: '#45b7d1' },
  ],
  triangle: [
    { id: 'b1', position: { x: 80, y: 0 }, velocity: { x: 0, y: 10.75 }, mass: 200, radius: 15, color: '#ff6b6b' },
    { id: 'b2', position: { x: -40, y: 69.28 }, velocity: { x: -9.31, y: -5.37 }, mass: 200, radius: 15, color: '#4ecdc4' },
    { id: 'b3', position: { x: -40, y: -69.28 }, velocity: { x: 9.31, y: -5.37 }, mass: 200, radius: 15, color: '#45b7d1' },
  ],
}
const simBodies = ref(demoPresets.figureEight)
const simPreset = ref('figureEight')
const simIntegration = ref('velocity-verlet')
const simG = ref(80)
const simTrailLen = ref(200)
const simShowTrails = ref(true)
const simAutoStart = ref(true)
const simZoom = ref(0.65)
const simTimeStep = ref(0.016)
const simStepsPerFrame = ref(1)
const simSoftening = ref(5)
const simShowVectors = ref(true)

const integrationOptions = [
  { value: 'euler', label: 'Euler' },
  { value: 'rk4', label: 'RK4' },
  { value: 'velocity-verlet', label: 'Velocity-Verlet' },
]
const presetOptions = [
  { value: 'figureEight', label: 'Figure-Eight' },
  { value: 'triangle', label: 'Lagrange Triangle' },
]

watch(simPreset, (val) => {
  simBodies.value = demoPresets[val as keyof typeof demoPresets]
})

const simCode = computed(() =>
  `<ThreeBodySimulation\n  :bodies="bodies"\n  integration-method="${simIntegration.value}"\n  gravitational-constant="${simG.value}"\n  :auto-start="${simAutoStart.value}"\n  :show-trails="${simShowTrails.value}"\n  :show-vectors="${simShowVectors.value}"\n  :trail-length="${simTrailLen.value}"\n  :zoom="${simZoom.value}"\n  :time-step="${simTimeStep.value}"\n  :steps-per-frame="${simStepsPerFrame.value}"\n  :softening="${simSoftening.value}"\n/>`
)

const tableColumns = [
  { key: 'name', label: 'Name' },
  { key: 'email', label: 'Email' },
  { key: 'role', label: 'Role', align: 'center' as const },
  { key: 'status', label: 'Status', align: 'right' as const },
]

const tableData = [
  { name: 'John Doe', email: 'john@example.com', role: 'Admin', status: 'Active' },
  { name: 'Jane Smith', email: 'jane@example.com', role: 'User', status: 'Active' },
  { name: 'Bob Wilson', email: 'bob@example.com', role: 'Editor', status: 'Inactive' },
  { name: 'Alice Brown', email: 'alice@example.com', role: 'User', status: 'Active' },
  { name: 'Charlie Davis', email: 'charlie@example.com', role: 'User', status: 'Pending' },
]
</script>

<template>
  <UiContainer>
    <section class="mb-8">
      <UiTabs v-model="activeTab" :tabs="tabs" />
    </section>

    <UiHeader :level="1" class="mb-8">UI Components Demo</UiHeader>

    <section class="mb-8">
      <UiCard>
        <UiCardContent>
          <UiTable :columns="tableColumns" :data="tableData" />
        </UiCardContent>
      </UiCard>
    </section>

    <div class="grid grid-cols-2 gap-8">
      <section>
        <UiHeader :level="2" class="mb-4">Buttons</UiHeader>
        <UiCard>
          <UiCardContent class="flex flex-wrap gap-3">
            <UiButton>Default</UiButton>
            <UiButton variant="destructive">Destructive</UiButton>
            <UiButton variant="outline">Outline</UiButton>
            <UiButton variant="secondary">Secondary</UiButton>
            <UiButton variant="ghost">Ghost</UiButton>
            <UiButton variant="link">Link</UiButton>
            <UiButton variant="active">Active</UiButton>
            <UiButton variant="outlined">Outlined</UiButton>
            <UiButton size="sm">Small</UiButton>
            <UiButton size="lg">Large</UiButton>
          </UiCardContent>
        </UiCard>
      </section>

      <section>
        <UiHeader :level="2" class="mb-4">Inputs</UiHeader>
        <UiCard>
          <UiCardContent class="form-group">
            <div class="form-row">
              <UiLabel for="name">Name</UiLabel>
              <UiInput v-model="name" id="name" placeholder="Enter your name" />
            </div>
            <div class="form-row">
              <UiLabel for="email">Email</UiLabel>
              <UiInput v-model="email" id="email" type="email" placeholder="Enter email" />
            </div>
            <div class="form-row">
              <UiLabel for="password">Password</UiLabel>
              <UiInput v-model="password" id="password" type="password" placeholder="Enter password" />
            </div>
            <div class="form-row">
              <UiLabel for="country">Country</UiLabel>
              <UiSelect v-model="country" id="country" :options="countries" placeholder="Select country" />
            </div>
          </UiCardContent>
        </UiCard>
      </section>

      <section>
        <UiHeader :level="2" class="mb-4">Form Controls</UiHeader>
        <UiCard>
          <UiCardContent class="form-group">
            <div class="form-row">
              <UiLabel>Checkbox</UiLabel>
              <div>
                <UiCheckbox v-model="checkboxValue" label="I agree to terms" />
              </div>
            </div>
            <div class="form-row">
              <UiLabel>Checkbox Group</UiLabel>
              <div>
                <UiCheckboxGroup v-model="checkboxGroup" :options="checkboxOptions" />
              </div>
            </div>
            <div class="form-row">
              <UiLabel>Radio Group</UiLabel>
              <div>
                <UiRadioGroup v-model="radioValue" :options="radioOptions" />
              </div>
            </div>
            <div class="form-row">
              <UiLabel>Input with Pre/Post</UiLabel>
              <div>
                <UiInputGroup pre="$" post=".00">
                  <UiInput v-model="price" placeholder="0" />
                </UiInputGroup>
              </div>
            </div>
          </UiCardContent>
        </UiCard>
      </section>

      <section>
        <UiHeader :level="2" class="mb-4">Headers</UiHeader>
        <UiCard>
          <UiCardContent class="space-y-4">
            <UiHeader :level="1">Heading 1</UiHeader>
            <UiHeader :level="2">Heading 2</UiHeader>
            <UiHeader :level="3">Heading 3</UiHeader>
            <UiHeader :level="4">Heading 4</UiHeader>
            <UiHeader :level="5">Heading 5</UiHeader>
            <UiHeader :level="6">Heading 6</UiHeader>
          </UiCardContent>
        </UiCard>
      </section>

      <section>
        <UiHeader :level="2" class="mb-4">Cards</UiHeader>
        <UiCard>
          <UiCardHeader>
            <UiCardTitle>Card Title</UiCardTitle>
            <UiCardDescription>This is a card description text that provides context.</UiCardDescription>
          </UiCardHeader>
          <UiCardContent>
            <p class="text-sm text-muted-foreground">
              This is the card content area where you can add any content.
            </p>
          </UiCardContent>
          <UiCardFooter>
            <UiButton variant="outline" size="sm">Cancel</UiButton>
            <UiButton size="sm">Confirm</UiButton>
          </UiCardFooter>
        </UiCard>
      </section>
    </div>

    <section class="mt-8">
      <UiHeader :level="2" class="mb-4">Simulation Component</UiHeader>
      <p class="text-sm text-muted-foreground mb-4">
        Reactive demo of <code>ThreeBodySimulation</code> — tweak controls and watch the simulation respond:
      </p>

      <div class="sim-layout">
        <div class="sim-canvas-wrap">
          <ThreeBodySimulation
            :bodies="simBodies"
            :integration-method="simIntegration"
            :gravitational-constant="simG"
            :auto-start="simAutoStart"
            :show-trails="simShowTrails"
            :show-vectors="simShowVectors"
            :trail-length="simTrailLen"
            :zoom="simZoom"
            :time-step="simTimeStep"
            :steps-per-frame="simStepsPerFrame"
            :softening="simSoftening"
          />
        </div>

        <UiCard class="sim-controls">
          <UiCardContent class="form-group">
            <div class="form-row">
              <UiLabel>Preset</UiLabel>
              <UiSelect v-model="simPreset" :options="presetOptions" />
            </div>
            <div class="form-row">
              <UiLabel>Method</UiLabel>
              <UiSelect v-model="simIntegration" :options="integrationOptions" />
            </div>
            <div class="form-row">
              <UiLabel>G</UiLabel>
              <UiInput :value="simG" type="number" step="1" @update:value="simG = Number($event)" />
            </div>
            <div class="form-row">
              <UiLabel>Trail len</UiLabel>
              <UiInput :value="simTrailLen" type="number" step="50" @update:value="simTrailLen = Number($event)" />
            </div>
            <div class="form-row">
              <UiLabel>Time step</UiLabel>
              <UiInput :value="simTimeStep" type="number" step="0.001" @update:value="simTimeStep = Number($event)" />
            </div>
            <div class="form-row">
              <UiLabel>Steps/frame</UiLabel>
              <UiInput :value="simStepsPerFrame" type="number" step="1" @update:value="simStepsPerFrame = Number($event)" />
            </div>
            <div class="form-row">
              <UiLabel>Softening</UiLabel>
              <UiInput :value="simSoftening" type="number" step="1" @update:value="simSoftening = Number($event)" />
            </div>
            <div class="form-row">
              <UiLabel>Zoom</UiLabel>
              <UiInput :value="simZoom" type="number" step="0.05" @update:value="simZoom = Number($event)" />
            </div>
            <div class="form-row">
              <UiCheckbox v-model="simShowTrails" label="Trails" />
            </div>
            <div class="form-row">
              <UiCheckbox v-model="simShowVectors" label="Vectors" />
            </div>
            <div class="form-row">
              <UiCheckbox v-model="simAutoStart" label="Auto start" />
            </div>
          </UiCardContent>
        </UiCard>
      </div>

      <pre class="code-block"><code>{{ simCode }}</code></pre>
    </section>
  </UiContainer>
</template>

<style scoped>
.sim-layout {
  display: grid;
  grid-template-columns: 1fr 220px;
  gap: 14px;
  margin-bottom: 14px;
}
.sim-canvas-wrap {
  height: 400px;
  border-radius: 8px;
  overflow: hidden;
  border: 1px solid var(--border);
}
.sim-controls :deep(.rounded-lg) {
  border: none;
  box-shadow: none;
}
.sim-controls :deep(.border) {
  border: 1px solid var(--border);
}
.sim-controls .form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.sim-controls .form-row {
  display: flex;
  flex-direction: column;
  gap: 3px;
}
.sim-controls .form-row:has(.aa-checkbox) {
  flex-direction: row;
  align-items: center;
}
.code-block {
  padding: 12px 14px;
  background: var(--muted);
  border-radius: 6px;
  overflow-x: auto;
  font-size: 12px;
  line-height: 1.5;
  margin: 0;
  white-space: pre-wrap;
}
.code-block code {
  font-family: 'SF Mono', 'Fira Code', monospace;
  color: var(--foreground);
}
.mt-8 { margin-top: 2rem; }
.mb-4 { margin-bottom: 16px; }

@media (max-width: 720px) {
  .sim-layout {
    grid-template-columns: 1fr;
  }
}
</style>