<template>
  <div class="min-h-screen bg-background text-foreground p-4">
    <div class="grid grid-cols-12 gap-4">
      <div class="col-span-3">
        <UiCard class="bg-card text-card-foreground">
          <UiCardHeader>
            <UiCardTitle>Main Menu</UiCardTitle>
          </UiCardHeader>
          <UiCardContent>
            <nav>
              <ul>
                <li><a href="#" class="text-primary hover:underline">Home</a></li>
                <li><a href="#" class="text-foreground hover:underline">About</a></li>
                <li><a href="#" class="text-foreground hover:underline">Contact</a></li>
              </ul>
            </nav>
          </UiCardContent>
        </UiCard>
      </div>
      <div class="col-span-9">
        <UiHero class="mb-4">
          <UiHeroTitle class="text-primary">Three-Body Problem</UiHeroTitle>
          <UiHeroDescription class="text-foreground">A simulation of the three-body problem in physics.</UiHeroDescription>
        </UiHero>
        <UiCard class="bg-card text-card-foreground mb-4">
          <UiCardContent>
            <p>
              The three-body problem is the problem of taking the initial positions and velocities
              (or momenta) of three point masses and solving for their subsequent motion according to
              Newton's laws of motion and Newton's law of universal gravitation. The three-body
              problem is one of the most famous problems in physics and mathematics.
            </p>
          </UiCardContent>
        </UiCard>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
</script>