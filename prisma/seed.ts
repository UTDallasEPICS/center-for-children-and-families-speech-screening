import { Param } from '@prisma/client/runtime/client'
import { prisma } from '../server/utils/prisma'

async function main() {
	console.log('Start seeding...')

	const user1 = await prisma.user.upsert({
		where: {email: 'amy210001@gmail.com'},
		update: {},
		create: {
			email: 'amy210001@gmail.com',
			role: 'ADMIN'
		}
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
