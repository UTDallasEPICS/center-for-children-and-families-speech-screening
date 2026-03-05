import { email } from 'zod';
import { auth } from '../../../server/utils/auth';
import { prisma } from '../../../server/utils/prisma';

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id');
  const session = await auth.api.getSession({ headers: event.headers });
  
  if (!session) throw createError({ statusCode: 401, statusMessage: 'Unauthorized' });

  // Allow if ADMIN or if the user is requesting their own profile
  if (session.user.role !== 'ADMIN' && session.user.id !== id) {
    throw createError({ statusCode: 403, statusMessage: 'Forbidden: You can only view your own profile' });
  }

  const user = await prisma.user.findUnique({
    where: { id },
  });

  if (!user) throw createError({ statusCode: 404, statusMessage: 'User not found' });
  
  return user;
});