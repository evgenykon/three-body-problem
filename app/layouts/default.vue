<script setup lang="ts">
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
          <UiButton variant="ghost">Dashboard</UiButton>
          <UiButton variant="ghost">Simulation</UiButton>
          <UiButton variant="ghost">Settings</UiButton>
        </div>
        
        <UiHeader :level="4" class="mt-4">Components</UiHeader>
        <div class="flex flex-col gap-1 mt-2">
          <UiButton variant="ghost">Buttons</UiButton>
          <UiButton variant="ghost">Inputs</UiButton>
          <UiButton variant="ghost">Cards</UiButton>
          <UiButton variant="ghost">Headers</UiButton>
          <UiButton variant="ghost">Labels</UiButton>
        </div>
      </aside>

      <main class="ml-64 flex-1 p-8">
        <slot />
      </main>
    </div>
  </div>
</template>