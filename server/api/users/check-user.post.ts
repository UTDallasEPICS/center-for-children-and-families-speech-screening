import { prisma } from '../../../server/utils/prisma'

export default defineEventHandler(async (event) => {
  const { email } = await readBody(event)

  const user = await prisma.user.findFirst({
    where: {
      email: {
        equals: email,
      },
    },
  })

  return { exists: !!user }
})
