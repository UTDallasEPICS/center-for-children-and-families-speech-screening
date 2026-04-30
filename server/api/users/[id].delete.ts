import { auth } from '../../../server/utils/auth';
import { prisma } from '../../../server/utils/prisma';

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id');
  const session = await auth.api.getSession({ headers: event.headers });

  const user = await prisma.user.findUnique({
    where: { id },
    select: { role: true },
  });

  const role = user?.role;
    
  if (!session) throw createError({ statusCode: 401, statusMessage: 'Unauthorized' });

  if (session.user.role === 'STUDENT') {
    throw createError({ statusCode: 403, statusMessage: 'Forbidden: Only admins can delete users' });
  }

  if(session.user.role === 'ADMIN' && (role == 'SUPER_ADMIN' || role === 'ADMIN')){
    throw createError({ statusCode: 403, statusMessage: 'Forbidden: Only super admins can delete admins' });
  }

    if(session.user.role === 'SUPER_ADMIN' && role == 'SUPER_ADMIN'){
    throw createError({ statusCode: 403, statusMessage: 'Forbidden: Only super admins can delete admins' });
  }


  // Safety mechanism: Stop admins from accidentally deleting their own account
  if (session.user.id === id) {
    throw createError({ statusCode: 400, statusMessage: 'Bad Request: You cannot delete your own admin account' });
  }

  await prisma.user.delete({
    where: { id }
  });

  return { success: true, message: 'User deleted successfully' };
});