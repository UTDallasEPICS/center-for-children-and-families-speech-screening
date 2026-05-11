import { auth } from '../../../server/utils/auth'
import { prisma } from '../../../server/utils/prisma'

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  const session = await auth.api.getSession({ headers: event.headers })

  if (!session) throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })

  if (session.user.role !== 'SUPER_ADMIN' && session.user.id !== id) {
    throw createError({
      statusCode: 403,
      statusMessage: 'Forbidden: Only Super Admin can change roles',
    })
  }

  const body = await readBody(event)

  // Security Check: Block privilege escalation
  if (session.user.role !== 'SUPER_ADMIN' && body.role && body.role === 'ADMIN') {
    throw createError({
      statusCode: 403,
      statusMessage: 'Forbidden: Cannot grant yourself admin privileges',
    })
  }

  const oldUser = await prisma.user.findUnique({
    where: { id },
  })

  if (!oldUser) {
    throw createError({
      statusCode: 403,
      statusMessage: 'User could not be found',
    })
  }

  let newData = oldUser

  if (body.role) {
    newData.role = body.role
  }
  if (body.expiresAt) {
    newData.expiresAt = body.expiresAt
  }

  const updatedUser = await prisma.user.update({
    where: { id },
    data: {
      role: newData.role,
      expiresAt: newData.expiresAt,
    },
  })

  return updatedUser
})
