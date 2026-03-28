import { auth } from '../../../server/utils/auth'
import { prisma } from '../../../server/utils/prisma'

export default defineEventHandler(async (event) => {
  const session = await auth.api.getSession({ headers: event.headers })

  if (!session) throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })

  if (session.user.role !== 'ADMIN') {
    throw createError({ statusCode: 403, statusMessage: 'Forbidden: Only admins can create users' })
  }

  const body = await readBody(event)
  const { email, role } = body

  if (!email) {
    throw createError({ statusCode: 400, statusMessage: 'Name and email are required' })
  }

  const existingUser = await prisma.user.findUnique({ where: { email } })
  if (existingUser) {
    throw createError({ statusCode: 409, statusMessage: 'User with this email already exists' })
  }

  const now = new Date()
  const expiresAt = new Date(now)
  expiresAt.setMonth(expiresAt.getMonth() + 6)

  const newUser = await prisma.user.create({
    data: {
      name,
      email,
      role: role || 'STUDENT',
      createdAt: now,
      expiresAt,
    },
  })

  return newUser
})
