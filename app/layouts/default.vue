<script setup lang="ts">
import { useRoute, useRouter } from 'vue-router'

const { t, locale, setLocale } = useI18n()

const route = useRoute()
const router = useRouter()

const menuItems = [
  { page: 'dashboard', label: t('nav.dashboard'), to: '/' },
  { page: 'demo', label: t('nav.uiDemo'), to: '/demo' },
]

const simulations = [
  { page: '2d-simple', label: t('nav.sim2d'), to: '/2d-simple' },
]

const solutions = [
  { page: 'soln-newton', label: t('nav.solnNewton'), to: '/solutions/newton' },
  { page: 'soln-euler', label: t('nav.solnEuler'), to: '/solutions/euler' },
  { page: 'soln-lagrange', label: t('nav.solnLagrange'), to: '/solutions/lagrange' },
  { page: 'soln-poincare', label: t('nav.solnPoincare'), to: '/solutions/poincare' },
  { page: 'soln-sundman', label: t('nav.solnSundman'), to: '/solutions/sundman' },
  { page: 'soln-numerical', label: t('nav.solnNumerical'), to: '/solutions/numerical' },
  { page: 'soln-periodic', label: t('nav.solnPeriodic'), to: '/solutions/periodic' },
  { page: 'soln-homological', label: t('nav.solnHomological'), to: '/solutions/homological' },
  { page: 'soln-ml', label: t('nav.solnMl'), to: '/solutions/ml' },
]

const isActive = (to: string) => route.path === to
const navigate = (to: string) => router.push(to)

const locales = [
  { code: 'en', label: 'EN' },
  { code: 'ru', label: 'RU' },
]
</script>

<template>
  <div class="min-h-screen bg-background">
    <UiNavbar fixed>
      <div class="flex items-center gap-2">
        <UiHeader :level="3" as="div">{{ t('nav.title') }}</UiHeader>
      </div>
      <div class="flex items-center gap-1">
        <button
          v-for="l in locales"
          :key="l.code"
          class="lang-btn"
          :class="{ 'lang-btn--active': locale === l.code }"
          @click="setLocale(l.code as 'en' | 'ru')"
        >
          {{ l.label }}
        </button>
      </div>
    </UiNavbar>

    <div class="flex pt-16">
      <aside class="fixed left-0 top-16 h-[calc(100vh-4rem)] w-64 border-r border-border bg-card p-4">
        <UiHeader :level="4">{{ t('nav.menu') }}</UiHeader>
        <div class="flex flex-col gap-1 mt-2">
          <div
            v-for="item in menuItems"
            :key="item.page"
            class="nav-item"
            :class="{ 'nav-item--active': isActive(item.to) }"
            @click="navigate(item.to)"
          >
            {{ item.label }}
          </div>
        </div>

        <UiHeader :level="4" class="mt-4">{{ t('nav.solutions') }}</UiHeader>
        <div class="flex flex-col gap-1 mt-2">
          <div
            v-for="item in solutions"
            :key="item.page"
            class="nav-item"
            :class="{ 'nav-item--active': isActive(item.to) }"
            @click="navigate(item.to)"
          >
            {{ item.label }}
          </div>
        </div>


        <UiHeader :level="4" class="mt-4">{{ t('nav.simulations') }}</UiHeader>
        <div class="flex flex-col gap-1 mt-2">
          <div
              v-for="item in simulations"
              :key="item.page"
              class="nav-item"
              :class="{ 'nav-item--active': isActive(item.to) }"
              @click="navigate(item.to)"
          >
            {{ item.label }}
          </div>
        </div>
      </aside>

      <main class="ml-64 flex-1 p-2">
        <slot />
      </main>
    </div>
  </div>
</template>

<style scoped>
.lang-btn {
  padding: 4px 10px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  border: 1px solid var(--border);
  background: transparent;
  color: var(--muted-foreground);
  transition: all 0.15s;
}

.lang-btn:hover {
  background: var(--muted);
  color: var(--foreground);
}

.lang-btn--active {
  background: var(--accent);
  color: var(--accent-foreground);
  border-color: var(--accent);
}
</style>

<style scoped>
.nav-item {
  padding: 8px 12px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  color: var(--foreground);
  transition: all 0.15s;
}

.nav-item:hover {
  background: var(--muted);
}

.nav-item--active {
  background: var(--accent);
  color: var(--accent-foreground);
}
</style>