<script setup lang="ts">
import { useRoute } from 'vue-router'

const route = useRoute()

const menuItems = [
  { page: 'dashboard', label: 'Dashboard' },
  { page: 'simulation', label: 'Simulation' },
  { page: 'settings', label: 'Settings' },
]

const componentItems = [
  { page: 'buttons', label: 'Buttons' },
  { page: 'inputs', label: 'Inputs' },
  { page: 'cards', label: 'Cards' },
  { page: 'headers', label: 'Headers' },
  { page: 'labels', label: 'Labels' },
]
</script>

<template>
  <div class="min-h-screen bg-background">
    <UiNavbar fixed>
      <div class="flex items-center gap-2">
        <UiHeader :level="3" as="div">Three Body Problem</UiHeader>
      </div>
      <div class="flex items-center gap-4">
        <UiButton variant="ghost" size="sm">Docs</UiButton>
        <UiButton variant="ghost" size="sm">About</UiButton>
        <UiButton size="sm">Get Started</UiButton>
      </div>
    </UiNavbar>

    <div class="flex pt-16">
      <aside class="fixed left-0 top-16 h-[calc(100vh-4rem)] w-64 border-r border-border bg-card p-4">
        <UiHeader :level="4">Menu</UiHeader>
        <div class="flex flex-col gap-1 mt-2">
          <UiButton
            v-for="item in menuItems"
            :key="item.page"
            variant="ghost"
            :active="route.path === '/' && item.page === 'dashboard'"
          >
            {{ item.label }}
          </UiButton>
        </div>
        
        <UiHeader :level="4" class="mt-4">Components</UiHeader>
        <div class="flex flex-col gap-1 mt-2">
          <UiButton
            v-for="item in componentItems"
            :key="item.page"
            variant="ghost"
          >
            {{ item.label }}
          </UiButton>
        </div>
      </aside>

      <main class="ml-64 flex-1 p-8">
        <slot />
      </main>
    </div>
  </div>
</template>