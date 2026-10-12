import { defineMiddleware } from 'astro:middleware';
import { requireAdmin } from './lib/adminAuth';

/**
 * Server-side guard: the admin panel pages (/admin and everything under it,
 * except /admin/login) are only accessible to an authenticated admin.
 * API routes under /api/admin perform their own requireAdmin() checks.
 */
export const onRequest = defineMiddleware(async (context, next) => {
  const { pathname } = context.url;

  const isAdminPage =
    pathname === '/admin' ||
    (pathname.startsWith('/admin/') && !pathname.startsWith('/admin/login'));

  if (!isAdminPage) return next();

  const admin = await requireAdmin(context.request);
  if (!admin) {
    // API-style requests get JSON 401; page requests get redirected to login.
    if (context.request.headers.get('Accept')?.includes('application/json')) {
      return new Response(JSON.stringify({ success: false, message: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }
    return context.redirect('/admin/login');
  }

  return next();
});
