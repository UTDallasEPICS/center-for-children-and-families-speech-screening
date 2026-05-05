import { auth } from '../../../server/utils/auth';
import { prisma } from '../../../server/utils/prisma';

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id');
  const session = await auth.api.getSession({ headers: event.headers });
  
  if (!session) throw createError({ statusCode: 401, statusMessage: 'Unauthorized' });

  if (session.user.role !== 'SUPER_ADMIN' && session.user.id !== id) {
    throw createError({ statusCode: 403, statusMessage: 'Forbidden: Only Super Admin can change roles' });
  }

  const body = await readBody(event);

  // Security Check: Block privilege escalation
  if (session.user.role !== 'SUPER_ADMIN' && body.role && body.role === 'ADMIN') {
    throw createError({ statusCode: 403, statusMessage: 'Forbidden: Cannot grant yourself admin privileges' });
  }

  const updatedUser = await prisma.user.update({
    where: { id },
    data: {
      email: body.email,
      role: body.role 
    }
  });

  return updatedUser;
});