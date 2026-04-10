import { prisma } from '../../../server/utils/prisma'

export default defineEventHandler(async () => {
  const deleted = await prisma.user.deleteMany({
    where: {
      expiresAt: {
        lt: new Date(),
      },
    },
  })

  return { deleted: deleted.count }
})
