import { authClient } from '../utils/auth-client'

export default defineNuxtRouteMiddleware(async (to) => {
  //DELETE THIS AFTER WE HAVE ACCOUNTS!!!! bypasses auth stuff for rn
  if (process.dev) return

  const { data: session } = await authClient.useSession(useFetch)

  if (session.value) {
    if (to.path === '/auth') {
      return navigateTo('/')
    }
  } else {
    if (to.path !== '/auth') {
      return navigateTo('/auth')
    }
  }
})