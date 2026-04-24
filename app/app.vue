<script setup lang="ts">
  import { authClient } from './utils/auth-client'
  import { computed, watch } from 'vue'

  //Auth Setup
  const sessionResult = authClient.useSession()
  const session = computed(() => sessionResult.value?.data ?? null)
  const route = useRoute()

  watch(session, (newSession) => {
    if (!newSession && route.path !== '/auth') navigateTo('/auth')
  })

  //Logic for information to display in user info
  const displayUser = computed(() => {
    const user = session.value?.user
    if (user) {
      return {
        email: user.email,
        role: (user as any).role || 'User',
      }
    }
  })

  //sign out function redirects to login
  async function signOut() {
    await authClient.signOut()
    await navigateTo('/auth')
  }
</script>

<template>
  <UApp>
    <div class="flex min-h-screen flex-col bg-gray-50">
      <!-- HEADER -->
      <header class="sticky top-0 z-50 border-b border-gray-200 bg-white shadow-sm">
        <div class="ml-0 flex h-16 w-full items-center justify-between px-6">
          <div class="flex items-center gap-2">
            <img src="/ccf-logo.png" alt="Center for Children and Families" class="h-12" />
            <div class="border-l border-gray-200 pl-2">
              <p class="text-main-blue text-xs leading-tight font-semibold">
                MCDI Percentile Calculator
              </p>
            </div>
          </div>

          <!-- Need to be valid user and it needs to be on index -->
          <div
            v-if="displayUser && (route.path === '/' || route.path === '/dashboard')"
            class="flex items-center gap-4"
          >
            <div class="flex items-center gap-2">
              <div class="text-right">
                <p class="font-mediumg text-sm text-gray-700">{{ displayUser.email }}</p>
                <p
                  class="text-confirmation-green text-[10px] font-semibold tracking-wider uppercase"
                >
                  {{ displayUser.role }}
                </p>
              </div>
            </div>
            <UButton
              icon="i-heroicons-cog-6-tooth"
              variant="ghost"
              color="neutral"
              @click="navigateTo('/dashboard')"
            />
            <!-- handles sign out logic -->
            <UButton variant="link" color="neutral" size="sm" @click="signOut">Sign Out</UButton>
          </div>
        </div>
      </header>

      <!-- PAGE CONTENT -->
      <main class="">
        <NuxtPage />
      </main>

      <!-- FOOTER -->
      <footer class="mt-auto border-t border-gray-200 bg-white">
        <div class="flex-center-JusBetween mx-auto max-w-[90rem] px-6 py-6">
          <div class="footnote-text">
            &copy; 2026 Center for Children and Families &middot; University of Texas at Dallas
          </div>
        </div>
      </footer>
    </div>
  </UApp>
</template>
