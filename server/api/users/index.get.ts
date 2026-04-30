import { auth } from '../../../server/utils/auth';
import { prisma } from '../../../server/utils/prisma';

export default defineEventHandler(async (event) => {
  // 1. Get the session (with modern event.headers)
  const session = await auth.api.getSession({ headers: event.headers });
  
  // 2. Check if logged in
  if (!session) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized' });
  }

  // 3. Check the role directly from the session object (The PM's requirement)
  if (session?.user.role !== 'ADMIN' && session?.user.role !== "SUPER_ADMIN") {
    throw createError({ statusCode: 403, statusMessage: 'Forbidden: Admins only' });
  }

  // 4. Fetch all users
  const users = await prisma.user.findMany();
  
  return users;
});