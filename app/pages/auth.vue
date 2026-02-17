<script setup lang="ts">
  import { z } from 'zod'
  import type { FormSubmitEvent } from '@nuxt/ui'
  import { authClient } from '../utils/auth-client'

  const toast = useToast()
  const isEmailSent = ref(false)

  const schema = computed(() => {
    if (!isEmailSent.value) {
      return z.object({
        email: z.string().email('Invalid email'),
      })
    } else {
      return z.object({
        email: z.string().email('Invalid email'),
        otp: z.array(z.string()).length(6, 'Must be 6 digits'),
      })
    }
  })

  const state = reactive({
    email: '',
    otp: [] as string[],
  })

  async function handleSubmit(event: FormSubmitEvent<any>) {
    if (!isEmailSent.value) {
      const { data, error } = await authClient.emailOtp.sendVerificationOtp({
        email: state.email,
        type: 'sign-in',
      })

      if (error) {
        toast.add({ title: 'Error', description: error.message, color: 'error' })
      } else {
        isEmailSent.value = true
        toast.add({ title: 'Success', description: 'OTP sent to your email', color: 'success' })
      }
    } else {
      const { data, error } = await authClient.signIn.emailOtp({
        email: state.email,
        otp: state.otp.join(''),
      })

      if (error) {
        toast.add({ title: 'Error', description: error.message, color: 'error' })
      } else {
        await navigateTo('/', { external: true })
      }
    }
  }
</script>

<template>
  <UApp>
    <div class="flex min-h-screen flex-col bg-gray-50">
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

      <!-- LOGIN CARD -->
      <main class="flex flex-1 items-center justify-center py-12">
        <div class="w-full max-w-sm rounded-lg border border-gray-200 bg-white p-8 shadow-md">
          <h2 class="mb-6 text-center text-2xl font-bold text-gray-900">Login</h2>

          <UForm :schema="schema" :state="state" @submit="handleSubmit" class="space-y-5">
            <!-- EMAIL FIELD -->
            <div v-if="!isEmailSent">
              <label class="mb-2 block text-sm font-medium text-gray-700">Email</label>
              <UInput
                v-model="state.email"
                type="email"
                placeholder="you@example.com"
                class="w-full"
                :ui="{ base: 'bg-white text-black' }"
              />
            </div>

            <!-- OTP FIELD -->
            <div v-if="isEmailSent">
              <label class="mb-2 block text-sm font-medium text-gray-700">Enter OTP</label>
              <UPinInput
                otp
                v-model="state.otp"
                :length="6"
                size="xl"
                class="flex w-full items-center justify-center"
                :ui="{ base: 'bg-white text-black' }"
              />
            </div>

            <!-- BUTTON -->
            <div class="flex justify-center">
              <UButton
                type="submit"
                class="flex w-32 justify-center bg-[#0077C0] text-white hover:bg-[#0065A6]"
              >
                {{ isEmailSent ? 'Login' : 'Send OTP' }}
              </UButton>
            </div>
          </UForm>
        </div>
      </main>
    </div>
  </UApp>
</template>
