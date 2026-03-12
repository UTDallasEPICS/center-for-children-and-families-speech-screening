<script setup lang="ts">
  import { z } from 'zod'
  import type { FormSubmitEvent } from '@nuxt/ui'
  import { authClient } from '../utils/auth-client'
  import './assets/css/main.css'

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
      <!-- LOGIN CARD -->
      <main class="flex-center-center flex-1 py-12">
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
                class="w-full flex-center-center"
                :ui="{ base: 'bg-white text-black' }"
              />
            </div>

            <!-- BUTTON -->
            <div class="flex-center-center">
              <UButton
                type="submit"
                class="flex-center-center w-32 bg-main-blue text-white hover:bg-main-blue/80"
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
