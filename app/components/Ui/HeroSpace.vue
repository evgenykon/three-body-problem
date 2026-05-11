<script setup lang="ts">
interface Props {
  title: string
  description?: string
}

defineProps<Props>()
</script>

<template>
  <div class="hero-space">
    <div class="hero-bg">
      <div class="starfield-wrapper">
        <Starfield />
      </div>
    </div>
    <div class="hero-content">
      <h1 class="hero-title">{{ title }}</h1>
      <p v-if="description" class="hero-desc">{{ description }}</p>
      <div class="hero-actions">
        <slot />
      </div>
    </div>
  </div>
</template>

<style scoped>
.hero-space {
  position: relative;
  height: 500px;
  border-radius: 12px;
  overflow: hidden;
  border: 1px solid var(--border);
  display: flex;
}

.hero-bg {
  position: absolute;
  inset: 0;
  z-index: 1;
}

.starfield-wrapper {
  width: 100%;
  height: 100%;
}

.hero-bg :deep(.relative) {
  width: 100%;
  height: 100%;
}

.hero-bg :deep(canvas) {
  width: 100% !important;
  height: 100% !important;
}

.hero-content {
  position: relative;
  z-index: 2;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  flex: 1;
  padding: 32px;
  background: rgba(0, 0, 0, 0.3);
}

.hero-title {
  font-size: 40px;
  font-weight: 700;
  margin: 0 0 16px;
  color: #fff;
  text-shadow: 0 2px 8px rgba(0,0,0,0.5);
}

.hero-desc {
  font-size: 18px;
  color: rgba(255,255,255,0.85);
  margin: 0 0 32px;
  text-shadow: 0 1px 4px rgba(0,0,0,0.5);
  text-align: center;
  max-width: 500px;
}

.hero-actions {
  display: flex;
  gap: 12px;
}
</style>