<script setup lang="ts">
import { ref } from 'vue'

definePageMeta({
  layout: 'default'
})

const name = ref('')
const email = ref('')
const password = ref('')
const country = ref('')
const countries = [
  { value: 'us', label: 'United States' },
  { value: 'uk', label: 'United Kingdom' },
  { value: 'ca', label: 'Canada' },
  { value: 'au', label: 'Australia' },
  { value: 'de', label: 'Germany' },
]

const checkboxValue = ref(false)
const checkboxGroup = ref<string[]>([])
const checkboxOptions = [
  { value: 'apple', label: 'Apple' },
  { value: 'banana', label: 'Banana' },
  { value: 'orange', label: 'Orange' },
]

const radioValue = ref('apple')
const radioOptions = [
  { value: 'apple', label: 'Apple' },
  { value: 'banana', label: 'Banana' },
  { value: 'orange', label: 'Orange' },
]

const price = ref('')

const activeTab = ref('general')
const tabs = [
  { value: 'general', label: 'General' },
  { value: 'security', label: 'Security' },
  { value: 'notifications', label: 'Notifications' },
  { value: 'advanced', label: 'Advanced' },
]

const tableColumns = [
  { key: 'name', label: 'Name' },
  { key: 'email', label: 'Email' },
  { key: 'role', label: 'Role', align: 'center' as const },
  { key: 'status', label: 'Status', align: 'right' as const },
]

const tableData = [
  { name: 'John Doe', email: 'john@example.com', role: 'Admin', status: 'Active' },
  { name: 'Jane Smith', email: 'jane@example.com', role: 'User', status: 'Active' },
  { name: 'Bob Wilson', email: 'bob@example.com', role: 'Editor', status: 'Inactive' },
  { name: 'Alice Brown', email: 'alice@example.com', role: 'User', status: 'Active' },
  { name: 'Charlie Davis', email: 'charlie@example.com', role: 'User', status: 'Pending' },
]
</script>

<template>
  <UiContainer>
    <section class="mb-8">
      <UiTabs v-model="activeTab" :tabs="tabs" />
    </section>

    <UiHeader :level="1" class="mb-8">UI Components Demo</UiHeader>

    <section class="mb-8">
      <UiCard>
        <UiCardContent>
          <UiTable :columns="tableColumns" :data="tableData" />
        </UiCardContent>
      </UiCard>
    </section>

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
            <UiButton variant="active">Active</UiButton>
            <UiButton variant="outlined">Outlined</UiButton>
            <UiButton size="sm">Small</UiButton>
            <UiButton size="lg">Large</UiButton>
          </UiCardContent>
        </UiCard>
      </section>

      <section>
        <UiHeader :level="2" class="mb-4">Inputs</UiHeader>
        <UiCard>
          <UiCardContent class="form-group">
            <div class="form-row">
              <UiLabel for="name">Name</UiLabel>
              <UiInput v-model="name" id="name" placeholder="Enter your name" />
            </div>
            <div class="form-row">
              <UiLabel for="email">Email</UiLabel>
              <UiInput v-model="email" id="email" type="email" placeholder="Enter email" />
            </div>
            <div class="form-row">
              <UiLabel for="password">Password</UiLabel>
              <UiInput v-model="password" id="password" type="password" placeholder="Enter password" />
            </div>
            <div class="form-row">
              <UiLabel for="country">Country</UiLabel>
              <UiSelect v-model="country" id="country" :options="countries" placeholder="Select country" />
            </div>
          </UiCardContent>
        </UiCard>
      </section>

      <section>
        <UiHeader :level="2" class="mb-4">Form Controls</UiHeader>
        <UiCard>
          <UiCardContent class="form-group">
            <div class="form-row">
              <UiLabel>Checkbox</UiLabel>
              <div>
                <UiCheckbox v-model="checkboxValue" label="I agree to terms" />
              </div>
            </div>
            <div class="form-row">
              <UiLabel>Checkbox Group</UiLabel>
              <div>
                <UiCheckboxGroup v-model="checkboxGroup" :options="checkboxOptions" />
              </div>
            </div>
            <div class="form-row">
              <UiLabel>Radio Group</UiLabel>
              <div>
                <UiRadioGroup v-model="radioValue" :options="radioOptions" />
              </div>
            </div>
            <div class="form-row">
              <UiLabel>Input with Pre/Post</UiLabel>
              <div>
                <UiInputGroup pre="$" post=".00">
                  <UiInput v-model="price" placeholder="0" />
                </UiInputGroup>
              </div>
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