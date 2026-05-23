<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'

const { t } = useI18n()

definePageMeta({
  layout: 'default',
})

const canvasRef = ref<HTMLCanvasElement | null>(null)
const animationId = ref<number | null>(null)

interface CollisionPoint {
  theta: number
  phi: number
  label: string
  x: number
  y: number
}

const collisionPoints: CollisionPoint[] = [
  { theta: Math.PI / 2, phi: 0, label: '1↔2', x: 0, y: 0 },
  { theta: Math.PI / 2, phi: 2 * Math.PI / 3, label: '2↔3', x: 0, y: 0 },
  { theta: Math.PI / 2, phi: 4 * Math.PI / 3, label: '3↔1', x: 0, y: 0 },
]

interface OrbitTrace {
  name: string
  color: string
  homology: string
  generate: (t: number, rot: number) => { theta: number; phi: number }
}

const orbitTraces: OrbitTrace[] = [
  {
    name: 'Figure-8',
    color: '#ff6b6b',
    homology: '(1, 1, 1)',
    generate: (t: number, rot: number) => {
      const phi = t + rot * 0.02
      const theta = Math.PI / 2 + 0.42 * Math.sin(t * 1)
      return {
        theta: Math.max(0.08, Math.min(Math.PI - 0.08, theta)),
        phi,
      }
    },
  },
  {
    name: 'Butterfly I',
    color: '#4ecdc4',
    homology: '(2, 1, 1)',
    generate: (t: number, rot: number) => {
      const phi = t + rot * 0.02 + 0.3 * Math.cos(2 * t)
      const theta = Math.PI / 2 + 0.38 * Math.sin(2 * t) * Math.cos(t * 0.5)
      return {
        theta: Math.max(0.08, Math.min(Math.PI - 0.08, theta)),
        phi,
      }
    },
  },
  {
    name: 'Moth I',
    color: '#45b7d1',
    homology: '(3, 1, 1)',
    generate: (t: number, rot: number) => {
      const phi = t + rot * 0.02 + 0.2 * Math.sin(3 * t)
      const theta = Math.PI / 2 + 0.35 * Math.sin(t * 1.5) * Math.cos(t * 0.7)
      return {
        theta: Math.max(0.08, Math.min(Math.PI - 0.08, theta)),
        phi,
      }
    },
  },
  {
    name: 'Yarn',
    color: '#dda0dd',
    homology: '(2, 3, 1)',
    generate: (t: number, rot: number) => {
      const phi = t + rot * 0.02 + 0.15 * Math.sin(4 * t)
      const theta = Math.PI / 2 + 0.3 * Math.sin(2 * t) * Math.cos(t * 0.3)
      return {
        theta: Math.max(0.08, Math.min(Math.PI - 0.08, theta)),
        phi,
      }
    },
  },
  {
    name: 'Bumblebee',
    color: '#ffd700',
    homology: '(3, 3, 3)',
    generate: (t: number, rot: number) => {
      const phi = t + rot * 0.02
      const theta = Math.PI / 2 + 0.45 * Math.sin(t * 3)
      return {
        theta: Math.max(0.08, Math.min(Math.PI - 0.08, theta)),
        phi,
      }
    },
  },
]

const classDetails = [
  { key: 'IA', color: '#ff6b6b' },
  { key: 'IB', color: '#4ecdc4' },
  { key: 'IIA', color: '#ffd700' },
  { key: 'IIB', color: '#dda0dd' },
  { key: 'IIC', color: '#87ceeb' },
]

const references = ['ref1', 'ref2', 'ref3', 'ref4', 'ref5', 'ref6', 'ref7']

let rotationAngle = 0

function projectToCanvas(theta: number, phi: number, cx: number, cy: number, r: number): { x: number; y: number } {
  const x = cx + r * Math.sin(theta) * Math.cos(phi)
  const y = cy + r * Math.sin(theta) * Math.sin(phi)
  return { x, y }
}

function drawShapeSphere() {
  if (!canvasRef.value) return
  const ctx = canvasRef.value.getContext('2d')
  if (!ctx) return

  const dpr = window.devicePixelRatio || 1
  const rect = canvasRef.value.getBoundingClientRect()
  canvasRef.value.width = rect.width * dpr
  canvasRef.value.height = rect.height * dpr
  ctx.scale(dpr, dpr)

  const w = rect.width
  const h = rect.height
  const cx = w / 2
  const cy = h / 2
  const r = Math.min(w, h) * 0.38

  ctx.clearRect(0, 0, w, h)

  // Draw sphere outline
  ctx.beginPath()
  ctx.arc(cx, cy, r, 0, Math.PI * 2)
  ctx.strokeStyle = '#444'
  ctx.lineWidth = 1.5
  ctx.stroke()

  // Draw meridians
  for (let i = 0; i < 12; i++) {
    const phi = (i / 12) * Math.PI * 2 + rotationAngle * 0.01
    ctx.beginPath()
    for (let t = 0; t <= 100; t++) {
      const theta = (t / 100) * Math.PI
      const p = projectToCanvas(theta, phi, cx, cy, r)
      if (t === 0) ctx.moveTo(p.x, p.y)
      else ctx.lineTo(p.x, p.y)
    }
    ctx.strokeStyle = i % 3 === 0 ? '#2a2a2a' : '#1a1a1a'
    ctx.lineWidth = i % 3 === 0 ? 0.8 : 0.4
    ctx.stroke()
  }

  // Draw parallels
  for (let j = 1; j < 6; j++) {
    const theta = (j / 6) * Math.PI
    ctx.beginPath()
    for (let i = 0; i <= 72; i++) {
      const phi = (i / 72) * Math.PI * 2 + rotationAngle * 0.01
      const p = projectToCanvas(theta, phi, cx, cy, r)
      if (i === 0) ctx.moveTo(p.x, p.y)
      else ctx.lineTo(p.x, p.y)
    }
    ctx.strokeStyle = '#1a1a1a'
    ctx.lineWidth = 0.4
    ctx.stroke()
  }

  // Highlight equator
  ctx.beginPath()
  for (let i = 0; i <= 72; i++) {
    const phi = (i / 72) * Math.PI * 2 + rotationAngle * 0.01
    const p = projectToCanvas(Math.PI / 2, phi, cx, cy, r)
    if (i === 0) ctx.moveTo(p.x, p.y)
    else ctx.lineTo(p.x, p.y)
  }
  ctx.strokeStyle = '#333'
  ctx.lineWidth = 1.2
  ctx.stroke()

  // Draw orbit traces on the sphere
  orbitTraces.forEach((trace) => {
    ctx.beginPath()
    ctx.lineWidth = 2
    ctx.strokeStyle = trace.color + '99'
    let first = true
    for (let i = 0; i <= 300; i++) {
      const t = (i / 300) * Math.PI * 2
      const { theta, phi } = trace.generate(t, rotationAngle)
      const p = projectToCanvas(theta, phi, cx, cy, r)
      if (first) {
        ctx.moveTo(p.x, p.y)
        first = false
      } else {
        ctx.lineTo(p.x, p.y)
      }
    }
    ctx.stroke()
  })

  // Draw collision points
  collisionPoints.forEach((cp) => {
    const phi = cp.phi + rotationAngle * 0.01
    const p = projectToCanvas(cp.theta, phi, cx, cy, r)
    cp.x = p.x
    cp.y = p.y

    ctx.beginPath()
    ctx.arc(p.x, p.y, 6, 0, Math.PI * 2)
    ctx.fillStyle = '#ff4444'
    ctx.fill()
    ctx.strokeStyle = '#ffffff'
    ctx.lineWidth = 1.5
    ctx.stroke()

    ctx.font = '11px monospace'
    ctx.fillStyle = '#aaa'
    ctx.textAlign = 'center'
    ctx.fillText(cp.label, p.x, p.y + 20)
  })

  // Labels
  ctx.font = '12px monospace'
  ctx.fillStyle = '#666'
  ctx.textAlign = 'center'
  ctx.fillText('N (L₄)', cx, cy - r - 12)
  ctx.fillText('S (L₅)', cx, cy + r + 22)
  ctx.font = '10px monospace'
  ctx.fillStyle = '#555'
  ctx.fillText('equator (collinear)', cx, cy + r * 0.15 + 16)

  // Legend
  const legendX = 12
  let legendY = 14
  ctx.font = '10px monospace'
  orbitTraces.forEach((trace) => {
    ctx.fillStyle = trace.color
    ctx.fillRect(legendX, legendY, 10, 10)
    ctx.fillStyle = '#999'
    ctx.textAlign = 'left'
    ctx.fillText(`${trace.name}  ${trace.homology}`, legendX + 14, legendY + 9)
    legendY += 16
  })
}

function animate() {
  rotationAngle += 0.25
  drawShapeSphere()
  animationId.value = requestAnimationFrame(animate)
}

onMounted(() => {
  animate()
})

onUnmounted(() => {
  if (animationId.value !== null) {
    cancelAnimationFrame(animationId.value)
  }
})
</script>

<template>
  <UiContainer>
    <article class="homological-page">
      <UiHeader :level="1" class="page-title">{{ t('homological.title') }}</UiHeader>

      <section class="content-section">
        <UiCard>
          <UiCardContent>
            <p class="lead-text">{{ t('homological.intro') }}</p>
          </UiCardContent>
        </UiCard>
      </section>

      <section class="content-section">
        <UiHeader :level="2" class="section-title">{{ t('homological.aaTitle') }}</UiHeader>
        <UiCard>
          <UiCardContent>
            <div class="aa-layout">
              <div class="aa-copy">
                <p>{{ t('homological.aaText') }}</p>

                <div class="info-block">
                  <h3>{{ t('homological.aaConstructionTitle') }}</h3>
                  <p>{{ t('homological.aaConstructionText') }}</p>
                </div>

                <div class="info-block">
                  <h3>{{ t('homological.aaInterpretationTitle') }}</h3>
                  <p>{{ t('homological.aaInterpretationText') }}</p>
                </div>

                <div class="info-block">
                  <h3>{{ t('homological.aaRelationTitle') }}</h3>
                  <p>{{ t('homological.aaRelationText') }}</p>
                </div>
              </div>

              <figure class="aa-diagram">
                <img
                  class="aa-map-image"
                  src="/agekyan-anosova-map.jpg"
                  alt="Agekyan-Anosova homology map"
                >
                <figcaption>{{ t('homological.aaDiagramCaption') }} <a class="aa-source" href="https://www.trv-science.ru/2024/01/383-0019/" target="_blank" rel="noopener">trv-science.ru</a></figcaption>
              </figure>
            </div>
          </UiCardContent>
        </UiCard>
      </section>

      <section class="content-section">
        <UiHeader :level="2" class="section-title">{{ t('homological.shapeSphereTitle') }}</UiHeader>
        <UiCard>
          <UiCardContent>
            <p>{{ t('homological.shapeSphereText') }}</p>
          </UiCardContent>
        </UiCard>
      </section>

      <section class="content-section">
        <UiHeader :level="2" class="section-title">{{ t('homological.coordinatesTitle') }}</UiHeader>
        <UiCard>
          <UiCardContent>
            <p>{{ t('homological.coordinatesText') }}</p>
            <div class="equation-block">
              <p class="equation-label">{{ t('homological.coordinatesEquationText') }}</p>
              <div class="equation">{{ t('homological.coordinatesEquation') }}</div>
            </div>
          </UiCardContent>
        </UiCard>
      </section>

      <section class="content-section">
        <UiHeader :level="2" class="section-title">{{ t('homological.hopfMapTitle') }}</UiHeader>
        <UiCard>
          <UiCardContent>
            <p>{{ t('homological.hopfMapText') }}</p>
          </UiCardContent>
        </UiCard>
      </section>

      <section class="content-section">
        <UiHeader :level="2" class="section-title">{{ t('homological.collisionTitle') }}</UiHeader>
        <UiCard>
          <UiCardContent>
            <p>{{ t('homological.collisionText') }}</p>
            <p class="collision-label">{{ t('homological.collisionCoordsText') }}</p>
            <ul class="collision-list">
              <li>p₁: {{ t('homological.collision12') }}</li>
              <li>p₂: {{ t('homological.collision23') }}</li>
              <li>p₃: {{ t('homological.collision31') }}</li>
            </ul>
          </UiCardContent>
        </UiCard>
      </section>

      <section class="content-section">
        <UiHeader :level="2" class="section-title">{{ t('homological.visualTitle') }}</UiHeader>
        <UiCard>
          <UiCardContent>
            <p class="visual-text">{{ t('homological.visualText') }}</p>
            <div class="canvas-container">
              <canvas ref="canvasRef" class="shape-canvas" />
            </div>
          </UiCardContent>
        </UiCard>
      </section>

      <section class="content-section">
        <UiHeader :level="2" class="section-title">{{ t('homological.homologyTitle') }}</UiHeader>
        <UiCard>
          <UiCardContent>
            <p>{{ t('homological.homologyText') }}</p>
            <p class="mt-2">{{ t('homological.homologyExampleText') }}</p>
          </UiCardContent>
        </UiCard>
      </section>

      <section class="content-section">
        <UiHeader :level="2" class="section-title">{{ t('homological.classificationTitle') }}</UiHeader>
        <UiCard>
          <UiCardContent>
            <p class="mb-4">{{ t('homological.classificationIntro') }}</p>
            <UiTable>
              <thead>
                <tr>
                  <th>{{ t('homological.classHeader') }}</th>
                  <th>{{ t('homological.orbitsHeader') }}</th>
                  <th>{{ t('homological.symmetryHeader') }}</th>
                  <th>{{ t('homological.exampleHeader') }}</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>I.A</td>
                  <td>{{ t('homological.classIaOrbits') }}</td>
                  <td>{{ t('homological.classIaSym') }}</td>
                  <td>{{ t('homological.classIaEx') }}</td>
                </tr>
                <tr>
                  <td>I.B</td>
                  <td>{{ t('homological.classIbOrbits') }}</td>
                  <td>{{ t('homological.classIbSym') }}</td>
                  <td>{{ t('homological.classIbEx') }}</td>
                </tr>
                <tr>
                  <td>II.A</td>
                  <td>{{ t('homological.classIiaOrbits') }}</td>
                  <td>{{ t('homological.classIiaSym') }}</td>
                  <td>{{ t('homological.classIiaEx') }}</td>
                </tr>
                <tr>
                  <td>II.B</td>
                  <td>{{ t('homological.classIibOrbits') }}</td>
                  <td>{{ t('homological.classIibSym') }}</td>
                  <td>{{ t('homological.classIibEx') }}</td>
                </tr>
                <tr>
                  <td>II.C</td>
                  <td>{{ t('homological.classIicOrbits') }}</td>
                  <td>{{ t('homological.classIicSym') }}</td>
                  <td>{{ t('homological.classIicEx') }}</td>
                </tr>
              </tbody>
            </UiTable>
          </UiCardContent>
        </UiCard>
      </section>

      <section class="content-section">
        <UiHeader :level="2" class="section-title">{{ t('homological.classDetailsTitle') }}</UiHeader>
        <UiCard>
          <UiCardContent>
            <p class="mb-4">{{ t('homological.classDetailsText') }}</p>
          </UiCardContent>
        </UiCard>
        <div class="class-details-grid">
          <div v-for="cd in classDetails" :key="cd.key" class="class-detail-card" :style="{ borderLeftColor: cd.color }">
            <UiCard>
              <UiCardContent>
                <p class="class-detail-class">
                  <span class="class-badge" :style="{ background: cd.color + '33', color: cd.color }">Class {{ cd.key }}</span>
                </p>
                <p class="class-detail-text">{{ t(`homological.class${cd.key}Detail`) }}</p>
              </UiCardContent>
            </UiCard>
          </div>
        </div>
      </section>

      <section class="content-section">
        <UiHeader :level="2" class="section-title">{{ t('homological.significanceTitle') }}</UiHeader>
        <UiCard>
          <UiCardContent>
            <p>{{ t('homological.significanceText') }}</p>
          </UiCardContent>
        </UiCard>
      </section>

      <section class="content-section references-section">
        <UiHeader :level="2" class="section-title">{{ t('homological.referencesTitle') }}</UiHeader>
        <UiCard>
          <UiCardContent>
            <ol class="reference-list">
              <li v-for="ref in references" :key="ref">
                {{ t(`homological.${ref}`) }}
              </li>
            </ol>
          </UiCardContent>
        </UiCard>
      </section>
    </article>
  </UiContainer>
</template>

<style scoped>
.homological-page {
  padding: 24px 0;
  max-width: 800px;
  margin: 0 auto;
}
.page-title { margin: 0 0 24px; }
.content-section { margin-bottom: 24px; }
.section-title { margin: 0 0 12px; }
.lead-text { font-size: 15px; line-height: 1.7; color: var(--muted-foreground); margin: 0; }
.visual-text { margin: 0 0 12px; }
.canvas-container {
  width: 100%;
  aspect-ratio: 1;
  max-height: 500px;
  border-radius: 8px;
  overflow: hidden;
  background: #0a0a0a;
  border: 1px solid var(--border);
}
.shape-canvas {
  display: block;
  width: 100%;
  height: 100%;
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

.aa-layout {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 300px;
  gap: 18px;
  align-items: start;
}
.aa-copy {
  min-width: 0;
}
.info-block {
  margin-top: 14px;
  padding: 12px 14px;
  border: 1px solid var(--border);
  border-radius: 8px;
  background: color-mix(in srgb, var(--muted) 55%, transparent);
}
.info-block h3 {
  margin: 0 0 6px;
  font-size: 13px;
  color: var(--foreground);
}
.aa-diagram {
  margin: 0;
}
.aa-map-image {
  display: block;
  width: 100%;
  border: 1px solid var(--border);
  border-radius: 10px;
  background: var(--muted);
}
.aa-diagram figcaption {
  margin-top: 8px;
  font-size: 11px;
  line-height: 1.5;
  color: var(--muted-foreground);
}
.aa-source {
  color: var(--accent);
  text-decoration: underline;
  text-underline-offset: 2px;
}
.aa-source:hover {
  opacity: 0.8;
}

@media (max-width: 720px) {
  .aa-layout {
    grid-template-columns: 1fr;
  }
  .aa-diagram {
    max-width: 300px;
    margin: 0 auto;
  }
}

.equation-block {
  margin-top: 12px;
  padding: 12px 16px;
  background: var(--muted);
  border-radius: 6px;
}
.equation-label {
  font-size: 12px !important;
  color: var(--muted-foreground) !important;
  margin-bottom: 4px !important;
}
.equation {
  font-family: 'SF Mono', 'Fira Code', monospace;
  font-size: 13px;
  color: var(--foreground);
  overflow-x: auto;
  white-space: nowrap;
  padding: 4px 0;
}

.collision-label {
  margin-top: 8px !important;
  font-size: 13px !important;
  font-weight: 500;
}
.collision-list {
  margin: 6px 0 0;
  padding: 0 0 0 20px;
  list-style: none;
}
.collision-list li {
  font-family: 'SF Mono', 'Fira Code', monospace;
  font-size: 12px;
  color: var(--muted-foreground);
  line-height: 1.8;
}
.collision-list li::before {
  content: '•';
  color: #ff4444;
  margin-right: 8px;
}

.class-details-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 8px;
  margin-top: 8px;
}
.class-detail-card {
  border-left: 3px solid;
  border-radius: 6px;
  overflow: hidden;
}
.class-detail-card :deep(.rounded-lg) {
  border: none;
  box-shadow: none;
}
.class-detail-card :deep(.border) {
  border: 1px solid var(--border);
}
.class-detail-class {
  margin-bottom: 6px !important;
}
.class-badge {
  display: inline-block;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.5px;
}
.class-detail-text {
  font-size: 13px !important;
  line-height: 1.6 !important;
}

.reference-list {
  margin: 0;
  padding: 0 0 0 18px;
}
.reference-list li {
  font-size: 12px;
  line-height: 1.6;
  color: var(--muted-foreground);
  margin-bottom: 6px;
}
.reference-list li:last-child {
  margin-bottom: 0;
}

.mt-2 { margin-top: 8px; }
.mb-4 { margin-bottom: 16px; }
</style>
