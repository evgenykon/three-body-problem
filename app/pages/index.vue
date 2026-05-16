<script setup lang="ts">
const { t } = useI18n()

definePageMeta({
  layout: 'default'
})

const timelineEntries = [
  { year: t('timeline.entry0y'), title: t('timeline.entry0t'), text: t('timeline.entry0d'), link: '/solutions/newton' },
  { year: t('timeline.entry1y'), title: t('timeline.entry1t'), text: t('timeline.entry1d'), link: '/solutions/euler' },
  { year: t('timeline.entry2y'), title: t('timeline.entry2t'), text: t('timeline.entry2d'), link: '/solutions/lagrange' },
  { year: t('timeline.entry3y'), title: t('timeline.entry3t'), text: t('timeline.entry3d'), link: '/solutions/poincare' },
  { year: t('timeline.entry4y'), title: t('timeline.entry4t'), text: t('timeline.entry4d'), link: '/solutions/sundman' },
  { year: t('timeline.entry5y'), title: t('timeline.entry5t'), text: t('timeline.entry5d'), link: '/solutions/numerical' },
  { year: t('timeline.entry6y'), title: t('timeline.entry6t'), text: t('timeline.entry6d'), link: '/solutions/periodic' },
  { year: t('timeline.entry7y'), title: t('timeline.entry7t'), text: t('timeline.entry7d'), link: '/solutions/ml' },
]
</script>

<template>
  <UiContainer>
    <section class="mb-8">
      <UiHeroSpace :title="t('home.title')" :description="t('home.description')">
      </UiHeroSpace>
    </section>

    <section class="info-section">
      <UiHeader :level="2" class="section-title">{{ t('info.title') }}</UiHeader>
      <div class="info-grid">
        <UiCard>
          <UiCardHeader>
            <UiCardTitle>{{ t('info.whatTitle') }}</UiCardTitle>
          </UiCardHeader>
          <UiCardContent>
            <p>{{ t('info.whatText') }}</p>
          </UiCardContent>
        </UiCard>
        <UiCard>
          <UiCardHeader>
            <UiCardTitle>{{ t('info.chaosTitle') }}</UiCardTitle>
          </UiCardHeader>
          <UiCardContent>
            <p>{{ t('info.chaosText') }}</p>
          </UiCardContent>
        </UiCard>
        <UiCard>
          <UiCardHeader>
            <UiCardTitle>{{ t('info.historyTitle') }}</UiCardTitle>
          </UiCardHeader>
          <UiCardContent>
            <p>{{ t('info.historyText') }}</p>
          </UiCardContent>
        </UiCard>
      </div>
    </section>

    <section class="timeline-section">
      <UiHeader :level="2" class="section-title">{{ t('timeline.title') }}</UiHeader>
      <div class="timeline">
        <div v-for="entry in timelineEntries" :key="entry.year" class="timeline-item">
          <div class="timeline-dot"></div>
          <div class="timeline-card">
            <UiCard>
              <UiCardHeader>
                <span class="timeline-year">{{ entry.year }}</span>
                <UiCardTitle>{{ entry.title }}</UiCardTitle>
              </UiCardHeader>
              <UiCardContent>
                <p>{{ entry.text }}</p>
                <NuxtLink :to="entry.link" class="timeline-link">
                  {{ t('timeline.readMore') }} →
                </NuxtLink>
              </UiCardContent>
            </UiCard>
          </div>
        </div>
      </div>
    </section>
  </UiContainer>
</template>

<style scoped>
.section-title {
  margin: 0 0 16px;
}

.info-section {
  margin-bottom: 32px;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 16px;
}

.info-grid p {
  margin: 0;
  line-height: 1.6;
  color: var(--muted-foreground);
  font-size: 14px;
}

.timeline-section {
  margin-bottom: 32px;
}

.timeline {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 0;
}

.timeline::before {
  content: '';
  position: absolute;
  left: 31px;
  top: 0;
  bottom: 0;
  width: 2px;
  background: var(--border);
}

.timeline-item {
  position: relative;
  display: flex;
  gap: 20px;
  padding: 0 0 24px;
}

.timeline-item:last-child {
  padding-bottom: 0;
}

.timeline-dot {
  position: relative;
  z-index: 1;
  flex-shrink: 0;
  width: 14px;
  height: 14px;
  border-radius: 50%;
  background: var(--accent);
  border: 3px solid var(--background);
  margin-top: 20px;
  margin-left: 25px;
}

.timeline-card {
  flex: 1;
  min-width: 0;
}

.timeline-card :deep(.card-header) {
  padding-bottom: 0;
}

.timeline-year {
  display: inline-block;
  font-family: monospace;
  font-size: 12px;
  font-weight: 700;
  color: var(--accent);
  margin-bottom: 4px;
}

.timeline-card p {
  margin: 0;
  line-height: 1.6;
  color: var(--muted-foreground);
  font-size: 14px;
}

.timeline-link {
  display: inline-block;
  margin-top: 8px;
  font-size: 13px;
  color: var(--accent);
  text-decoration: none;
  opacity: 0.7;
  transition: opacity 0.15s;
}

.timeline-link:hover {
  opacity: 1;
  text-decoration: underline;
}
</style>