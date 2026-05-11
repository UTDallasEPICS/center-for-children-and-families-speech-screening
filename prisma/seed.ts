import { Param } from '@prisma/client/runtime/client'
import { PrismaClient } from './generated/client'
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3'
import 'dotenv/config'
const connectionString = `${process.env.DATABASE_URL}`

const adapter = new PrismaBetterSqlite3({ url: connectionString })
const prisma = new PrismaClient({ adapter })
async function main() {
  console.log('Start seeding...')

  const admin_email = `${process.env.SUPER_ADMIN_EMAIL}`

  const user1 = await prisma.user.upsert({
    where: { email: admin_email },
    update: {},
    create: {
      email: admin_email,
      role: 'SUPER_ADMIN',
    },
  })

  console.log({ user1 })
  console.log('Seeding finished.')
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
