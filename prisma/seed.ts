import { Param } from "@prisma/client/runtime/client"
import { prisma } from "../server/utils/prisma"

async function main() {
	console.log('Start seeding...')

	// 1. Create a User with a Password (Local Auth)
	const user1 = await prisma.user.create({
		data: {
			id: 'user_01',
			name: 'Alice Developer',
			email: 'alice@example.com',
			emailVerified: true,
			accounts: {
				create: {
					id: 'acc_01',
					accountId: 'alice_local_id',
					providerId: 'credential', // Common for email/password
					password: 'hashed_password_here', // In a real app, hash this!
				},
			},
		},
	})

	// 2. Create a User with an OAuth Account (e.g., Google)
	const user2 = await prisma.user.create({
		data: {
			id: 'user_02',
			name: 'Bob Tester',
			email: 'bob@example.com',
			emailVerified: true,
			accounts: {
				create: {
					id: 'acc_02',
					accountId: 'bob_google_id',
					providerId: 'google',
					accessToken: 'mock_access_token',
				},
			},
		},
	})

	const user3 = await prisma.user.create({
		data: {
			id: 'user_03',
			name: 'Tushar Wani',
			email: 'reachtusharwani@gmail.com'
		}
	})

	console.log({ user1, user2, user3 })
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
