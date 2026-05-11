<script setup lang="ts">
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()

const menuItems = [
  { page: 'dashboard', label: 'Dashboard', to: '/' },
  { page: 'demo', label: 'UI Demo', to: '/demo' },
]

const simulations = [
  { page: '2d-simple', label: '2D Simple', to: '/2d-simple' },
]

const isActive = (to: string) => route.path === to
const navigate = (to: string) => router.push(to)
</script>

<template>
  <div class="min-h-screen bg-background">
    <UiNavbar fixed>
      <div class="flex items-center gap-2">
        <UiHeader :level="3" as="div">Three Body Problem</UiHeader>
      </div>
      <div class="flex items-center gap-4">
      </div>
    </UiNavbar>

    <div class="flex pt-16">
      <aside class="fixed left-0 top-16 h-[calc(100vh-4rem)] w-64 border-r border-border bg-card p-4">
        <UiHeader :level="4">Menu</UiHeader>
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
        
        <UiHeader :level="4" class="mt-4">Simulations</UiHeader>
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

      <main class="ml-64 flex-1 p-8">
        <slot />
      </main>
    </div>
  </div>
</template>

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