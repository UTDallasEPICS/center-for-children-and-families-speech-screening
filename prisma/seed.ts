import { Param } from '@prisma/client/runtime/client'
import { prisma } from '../server/utils/prisma'

async function main() {
	console.log('Start seeding...')

	const user1 = await prisma.user.create({
		data: {
			id: 'user_03',
			email: 'amy210001@gmail.com'
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
