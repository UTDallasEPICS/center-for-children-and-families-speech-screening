import { auth } from '../../../server/utils/auth';
import { prisma } from '../../../server/utils/prisma';

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id');
  const session = await auth.api.getSession({ headers: event.headers });
  
  if (!session) throw createError({ statusCode: 401, statusMessage: 'Unauthorized' });

  if (session.user.role !== 'ADMIN' && session.user.id !== id) {
    throw createError({ statusCode: 403, statusMessage: 'Forbidden: You can only edit your own profile' });
  }

  const body = await readBody(event);

  // Security Check: Block privilege escalation
  if (session.user.role !== 'ADMIN' && body.role && body.role === 'ADMIN') {
    throw createError({ statusCode: 403, statusMessage: 'Forbidden: Cannot grant yourself admin privileges' });
  }

  const updatedUser = await prisma.user.update({
    where: { id },
    data: {
      name: body.name,
      email: body.email,
      role: body.role 
    }
  });

  return updatedUser;
});