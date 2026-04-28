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

  const cleanEmail = email.replace('@utdallas.edu', '')

  if (!email) {
    throw createError({ statusCode: 400, statusMessage: 'Email is required' })
  }

  const existingUser = await prisma.user.findUnique({ where: { email } })
  if (existingUser) {
    throw createError({ statusCode: 409, statusMessage: 'User with this email already exists' })
  }

  const expirationDate = new Date()
  expirationDate.setMonth(expirationDate.getMonth() + 4)
  const newUser = await prisma.user.create({
    data: {
      email: email,
      role: role || 'STUDENT',
      expiresAt: expirationDate,
    },
  })

  return newUser
})
