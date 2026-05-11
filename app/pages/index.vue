<script setup lang="ts">
import { ref } from 'vue'

definePageMeta({
  layout: 'default'
})

const name = ref('')
const email = ref('')
const password = ref('')
</script>

<template>
  <UiContainer>
    <section class="mb-8">
      <UiHeroSpace title="Three Body Problem Simulator" description="Explore the chaotic dynamics of three gravitational bodies in space.">
        <UiButton>Start Simulation</UiButton>
        <UiButton variant="outline">Learn More</UiButton>
      </UiHeroSpace>
    </section>

    <UiHeader :level="1" class="mb-8">UI Components Demo</UiHeader>

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
            <UiButton size="sm">Small</UiButton>
            <UiButton size="lg">Large</UiButton>
          </UiCardContent>
        </UiCard>
      </section>

      <section>
        <UiHeader :level="2" class="mb-4">Inputs</UiHeader>
        <UiCard>
          <UiCardContent class="space-y-4">
            <div>
              <UiLabel for="name">Name</UiLabel>
              <UiInput v-model="name" id="name" placeholder="Enter your name" class="mt-1" />
            </div>
            <div>
              <UiLabel for="email">Email</UiLabel>
              <UiInput v-model="email" id="email" type="email" placeholder="Enter email" class="mt-1" />
            </div>
            <div>
              <UiLabel for="password">Password</UiLabel>
              <UiInput v-model="password" id="password" type="password" placeholder="Enter password" class="mt-1" />
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
  </UiContainer>
</template>