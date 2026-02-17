<script setup lang="ts">
  const colorMode = useColorMode()

  const isDark = computed({
    get() {
      return colorMode.value === 'dark'
    },
    set() {
      colorMode.preference = colorMode.value === 'dark' ? 'light' : 'dark'
    },
  })
</script>

<template>
  <UApp>
    <div
      class="flex min-h-screen flex-col bg-white text-gray-900 transition-colors duration-300 dark:bg-gray-900 dark:text-gray-100"
    >
      <!-- HEADER -->
      <header>
        <div class="sticky top-0 z-50 border-b border-gray-200 bg-white shadow-sm">
          <div class="mx-auto flex h-16 max-w-[90rem] items-center justify-between px-6">
            <!-- Logo + Title -->
            <div class="flex items-center gap-2">
              <img src="/ccf-logo.png" alt="Center for Children and Families" class="h-12" />
              <div class="border-l border-gray-200 pl-2">
                <p class="text-xs leading-tight font-semibold !text-[#0077C0]">
                  MCDI Percentile Calculator
                </p>
              </div>
            </div>

            <!-- User Info -->
            <div class="flex items-center gap-4">
              <div class="flex items-center gap-2">
                <div class="flex h-8 w-8 items-center justify-center rounded-full bg-[#0077C0]">
                  <span class="text-sm font-semibold text-white">JX</span>
                </div>
                <div class="text-right">
                  <p class="text-sm font-medium text-gray-700">Dr. Jingyi Xu</p>
                  <p class="text-[10px] font-semibold tracking-wider !text-[#8DC63F] uppercase">
                    Admin
                  </p>
                </div>
              </div>

              <UButton icon="i-heroicons-cog-6-tooth" variant="ghost" color="neutral" />
              <UButton variant="link" color="neutral" size="sm">Sign Out</UButton>
            </div>
          </div>
        </div>
      </header>

      <main class="flex-1">
        <NuxtPage />
      </main>
    </div>
  </UApp>
</template>
