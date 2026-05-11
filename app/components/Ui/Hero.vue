<script setup lang="ts">
interface Props {
  title: string
  description?: string
}

defineProps<Props>()
</script>

<template>
  <div class="hero">
    <h1 class="hero-title">{{ title }}</h1>
    <p v-if="description" class="hero-desc">{{ description }}</p>
    <div class="hero-actions">
      <slot />
    </div>
  </div>
</template>

<style scoped>
.hero {
  padding: 48px 32px;
  text-align: center;
  background: var(--card);
  border-radius: 12px;
  border: 1px solid var(--border);
}

.hero-title {
  font-size: 32px;
  font-weight: 700;
  margin: 0 0 12px;
  color: var(--foreground);
}

.hero-desc {
  font-size: 16px;
  color: var(--muted-foreground);
  margin: 0 0 24px;
}

.hero-actions {
  display: flex;
  gap: 12px;
  justify-content: center;
}
</style>