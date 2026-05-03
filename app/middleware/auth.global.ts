import { user } from '#build/ui'
import { authClient } from '../utils/auth-client'

export default defineNuxtRouteMiddleware(async (to) => {
  const { data: session } = await authClient.useSession(useFetch)
  const currentuser = session.value?.user as { role?: string } | undefined

  if (session.value) {
    if (to.path === '/auth') {
      return navigateTo('/')
    }
  } else {
    if (to.path !== '/auth') {
      return navigateTo('/auth')
    }
  }
  if (currentuser !== undefined) {
    if (to.path.startsWith('/dashboard') && (currentuser.role !== 'ADMIN' && currentuser.role != 'SUPER_ADMIN')) {
      return navigateTo('/')
    }
  }
})
