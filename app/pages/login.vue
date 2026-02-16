<template>
  <UApp>
    <div class="flex min-h-screen flex-col bg-gray-50">
      <!-- Header with logo and user info -->
      <header>
        <div class="sticky top-0 z-50 border-b border-gray-200 bg-white shadow-sm">
          <div class="mx-auto flex h-16 max-w-[90rem] items-center justify-between px-6">
            <!-- Logo and app title -->
            <div class="flex items-center gap-2">
              <img src="/ccf-logo.png" alt="Center for Children and Families" class="h-12" />
              <div class="border-l border-gray-200 pl-2">
                <p class="text-xs leading-tight font-semibold text-[#0077C0]">
                  MCDI Percentile Calculator
                </p>
              </div>
            </div>

            <!-- User profile and actions -->
            <div class="flex items-center gap-4">
              <div class="flex items-center gap-2">
                <div class="flex h-8 w-8 items-center justify-center rounded-full bg-[#0077C0]">
                  <span class="text-sm font-semibold text-white">JX</span>
                </div>
                <div class="text-right">
                  <p class="text-sm font-medium text-gray-700">Dr. Jingyi Xu</p>
                  <p class="text-[10px] font-semibold tracking-wider text-[#8DC63F] uppercase">
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

      <!-- Login form -->
      <main class="flex flex-1 items-center justify-center py-12">
        <div class="w-full max-w-sm rounded-lg border border-gray-200 bg-white p-8 shadow-md">
          <h2 class="mb-6 text-center text-2xl font-bold text-gray-900">Login</h2>
          <!-- Username part -->
          <form class="space-y-4">
            <div>
              <label class="mb-2 block text-sm font-medium text-gray-700">Email</label>
              <UInput
                type="email"
                placeholder="you@example.com"
                class="w-full"
                style="background-color: white !important; color: black"
              />
            </div>
            <!-- Password part -->
            <div>
              <label class="mb-2 block text-sm font-medium text-gray-700">Password</label>
              <UInput
                type="password"
                placeholder="••••••••"
                class="w-full"
                style="background-color: white !important; color: black"
              />
            </div>
            <!-- Sign-in Button -->
            <div class="flex justify-center">
              <UButton type="submit" class="flex w-20 justify-center bg-[#0077C0]">
                Sign In
              </UButton>
            </div>
          </form>
        </div>
      </main>
    </div>
  </UApp>
</template>

<script setup lang="ts">
  // Login page component - handles user authentication via email and password
</script>
