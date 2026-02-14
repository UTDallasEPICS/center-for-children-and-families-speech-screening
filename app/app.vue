<script setup lang="ts">
import { authClient } from './utils/auth-client'

//Auth Setup
const sessionResult = authClient.useSession()
const session = sessionResult?.data ?? ref(null)
const route = useRoute()

//DELETE THIS AFTER WE HAVE ACCOUNTS!!!! Dev profile until we make accounts
const isDev = process.dev
const devUser = {
  name: 'Dev User',
  email: 'dev@utdallas.edu',
  initials: 'DU',
  role: 'Admin',
}

//Logic for information to display in user info
const displayUser = computed(() => {
  const user = session.value?.user
  if (user) {
    return {
      name: user.name || user.email,
      initials: user.name?.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase() || '?',
      role: (user as any).role || 'User',
    }
  }
  //DELETE AFTER!!!!!
  if (isDev) return devUser
  return null
})

//sign out function redirects to login 
async function signOut() {
  await authClient.signOut()
  await navigateTo('/auth')
}
</script>

<template>
  <UApp>
    <div class="min-h-screen bg-gray-50 flex flex-col">
      <!-- HEADER -->
      <header class="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
        <div class="max-w-[90rem] mx-auto px-6 h-16 flex items-center justify-between">
          <div class="flex items-center gap-2">
            <img src="/ccf-logo.png" alt="Center for Children and Families" class="h-12" />
            <div class="border-l border-gray-200 pl-2">
              <p class="text-xs font-semibold text-[#0077C0] leading-tight">MCDI Percentile Calculator</p>
            </div>
          </div>

          <!-- Need to be valid user and it needs to be on index -->
          <div v-if="displayUser && route.path === '/'" class="flex items-center gap-4">

            <div class="flex items-center gap-2">
              <div class="w-8 h-8 rounded-full bg-[#0077C0] flex items-center justify-center">
                <span class="text-white text-sm font-semibold">{{ displayUser.initials }}</span>
              </div>
              <div class="text-right">
                <p class="text-sm font-medium text-gray-700">{{ displayUser.name }}</p>
                <p class="text-[10px] text-[#8DC63F] font-semibold uppercase tracking-wider">{{ displayUser.role }}</p>
              </div>
            </div>
            <UButton icon="i-heroicons-cog-6-tooth" variant="ghost" color="neutral" />
            <!-- handles sign out logic -->
            <UButton variant="link" color="neutral" size="sm" @click="signOut">Sign Out</UButton>
          </div>
        </div>
      </header>

      <!-- PAGE CONTENT -->
      <main class="flex-1">
        <NuxtPage />
      </main>

      <!-- FOOTER -->
      <footer class="border-t border-gray-200 bg-white mt-auto">
        <div class="max-w-[90rem] mx-auto px-6 py-6 flex items-center justify-between">
          <div class="text-xs text-gray-400">&copy; 2026 Center for Children and Families &middot; University of Texas at Dallas</div>
          <div class="text-xs text-gray-300">The Samuel Mogs</div>
        </div>
      </footer>
    </div>
  </UApp>
</template>