<script setup lang="ts">
const { t } = useI18n()

definePageMeta({
  layout: 'default'
})
</script>

<template>
  <UiContainer>
    <section class="mb-8">
      <UiHeroSpace :title="t('home.title')" :description="t('home.description')">
      </UiHeroSpace>
    </section>

    <section class="info-section">
      <UiHeader :level="2" class="info-title">{{ t('info.title') }}</UiHeader>
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
  </UiContainer>
</template>

<style scoped>
.info-section {
  margin-bottom: 32px;
}

.info-title {
  margin: 0 0 16px;
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
</style>