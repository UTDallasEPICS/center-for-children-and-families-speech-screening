import { prisma } from "../../../utils/prisma"

export default defineEventHandler((event) => {
	return prisma.user.findMany();
})
