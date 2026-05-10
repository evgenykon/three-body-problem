<template>
  <div class="min-h-screen flex flex-col bg-gray-50">
    <!-- Header -->
    <header class="bg-white shadow-sm border-b">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between h-16">
          <div class="flex">
            <div class="flex-shrink-0 flex items-center">
              <span class="text-xl font-semibold text-gray-800">Dashboard</span>
            </div>
          </div>
          <div class="hidden md:block">
            <div class="ml-10 flex items-baseline space-x-4">
              <a href="#" class="px-3 py-2 rounded-md text-sm font-medium text-gray-500 hover:text-gray-700 hover:bg-gray-50">Dashboard</a>
              <a href="#" class="px-3 py-2 rounded-md text-sm font-medium text-gray-500 hover:text-gray-700 hover:bg-gray-50">Analytics</a>
              <a href="#" class="px-3 py-2 rounded-md text-sm font-medium text-gray-500 hover:text-gray-700 hover:bg-gray-50">Reports</a>
              <a href="#" class="px-3 py-2 rounded-md text-sm font-medium text-gray-500 hover:text-gray-700 hover:bg-gray-50">Settings</a>
            </div>
          </div>
          <div class="flex items-center">
            <div class="relative">
              <div class="flex-1 sm:hidden">
                <!-- Mobile menu button -->
                <button type="button" class="inline-flex items-center p-2 ml-3 text-sm text-gray-400 hover:text-gray-500 hover:bg-gray-100 rounded-md">
                  <svg class="h-6 w-6" stroke="currentColor" fill="none" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path>
                  </svg>
                </button>
              </div>
              <div class="ml-3 relative">
                <div class="relative">
                  <button type="button" class="max-w-xs bg-white flex text-left space-x-3 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-200" id="user-menu-button" aria-expanded="false" aria-haspopup="true">
                    <span class="sr-only">Open user menu</span>
                    <img class="h-8 w-8 rounded-full" src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80" alt="" />
                    <div class="ml-3">
                      <div class="text-base font-medium leading-none text-gray-800">John Doe</div>
                      <div class="text-sm font-medium leading-none text-gray-500">john@example.com</div>
                    </div>
                    <svg class="ml-2 h-5 w-5" stroke="currentColor" fill="none" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>

    <!-- Mobile menu (hidden by default) -->
    <nav class="md:hidden" id="mobile-menu">
      <div class="pt-2 pb-3 space-y-1">
        <a href="#" class="px-3 py-2 rounded-md text-base font-medium text-gray-500 hover:text-gray-700 hover:bg-gray-50">Dashboard</a>
        <a href="#" class="px-3 py-2 rounded-md text-base font-medium text-gray-500 hover:text-gray-700 hover:bg-gray-50">Analytics</a>
        <a href="#" class="px-3 py-2 rounded-md text-base font-medium text-gray-500 hover:text-gray-700 hover:bg-gray-50">Reports</a>
        <a href="#" class="px-3 py-2 rounded-md text-base font-medium text-gray-500 hover:text-gray-700 hover:bg-gray-50">Settings</a>
      </div>
    </nav>

    <!-- Main Content -->
    <div class="flex-1 flex">
      <!-- Sidebar -->
      <aside class="hidden w-64 bg-white border-r border-gray-200 lg:block">
        <div class="px-2 pt-2 pb-3">
          <div class="flex items-center px-3">
            <span class="flex-shrink-0 h-8 w-8">
              <img class="h-8 w-8 rounded-full" src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80" alt="" />
            </div>
            <div class="ml-3">
              <p class="text-base font-medium text-gray-800">John Doe</p>
              <p class="text-sm font-medium text-gray-500">john@example.com</p>
            </div>
          </div>
        </div>
        <nav class="mt-5 space-y-1">
          <a href="#" class="flex items-center px-3 py-2 text-sm font-medium text-gray-500 rounded-md hover:bg-gray-100 hover:text-gray-900">
            <svg class="flex-shrink-0 w-5 h-5 text-gray-400 transition-transform duration-200 mr-3" stroke="currentColor" fill="none" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-9 8h4"></path>
            </svg>
            Dashboard
          </a>
          <a href="#" class="flex items-center px-3 py-2 text-sm font-medium text-gray-500 rounded-md hover:bg-gray-100 hover:text-gray-900">
            <svg class="flex-shrink-0 w-5 h-5 text-gray-400 transition-transform duration-200 mr-3" stroke="currentColor" fill="none" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
            Analytics
          </a>
          <a href="#" class="flex items-center px-3 py-2 text-sm font-medium text-gray-500 rounded-md hover:bg-gray-100 hover:text-gray-900">
            <svg class="flex-shrink-0 w-5 h-5 text-gray-400 transition-transform duration-200 mr-3" stroke="currentColor" fill="none" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
            </svg>
            Reports
          </a>
          <a href="#" class="flex items-center px-3 py-2 text-sm font-medium text-gray-500 rounded-md hover:bg-gray-100 hover:text-gray-900">
            <svg class="flex-shrink-0 w-5 h-5 text-gray-400 transition-transform duration-200 mr-3" stroke="currentColor" fill="none" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3"></path>
            </svg>
            Settings
          </a>
        </nav>
      </aside>

      <!-- Page Content -->
      <main class="flex-1 w-full overflow-y-auto">
        <div class="p-6">
          <slot></slot>
        </div>
      </main>
    </div>

    <!-- Footer -->
    <footer class="bg-white border-t border-gray-200">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <p class="text-sm text-gray-500">
          © 2026 Dashboard Template. All rights reserved.
        </p>
      </div>
    </footer>
  </div>
</template>

<script setup>
// Mobile menu toggle functionality
import { onMounted, onBeforeUnmount, ref } from 'vue'

const mobileMenuOpen = ref(false)

function toggleMobileMenu() {
  mobileMenuOpen.value = !mobileMenuOpen.value
}

function closeMobileMenu() {
  mobileMenuOpen.value = false
}

onMounted(() => {
  // Add event listeners for mobile menu
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && mobileMenuOpen.value) {
      closeMobileMenu()
    }
  })
  
  // Close mobile menu when clicking outside
  const handleClickOutside = (event) => {
    const mobileMenu = document.getElementById('mobile-menu')
    const mobileMenuButton = document.querySelector('[aria-controls="mobile-menu"]')
    
    if (mobileMenu && mobileMenuButton && 
        !mobileMenu.contains(event.target) && 
        !mobileMenuButton.contains(event.target) &&
        mobileMenuOpen.value) {
      closeMobileMenu()
    }
  }
  
  document.addEventListener('mousedown', handleClickOutside)
})

onBeforeUnmount(() => {
  // Clean up event listeners
  document.removeEventListener('keydown', toggleMobileMenu)
  document.removeEventListener('mousedown', handleClickOutside)
})
</script>

<style scoped>
/* Active link styles */
.active {
  @apply bg-indigo-50 text-indigo-600;
}

/* Hover states for sidebar */
.sidebar-link:hover {
  @apply bg-gray-50 text-gray-900;
}
</style>