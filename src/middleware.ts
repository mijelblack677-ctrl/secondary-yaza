import { defineMiddleware } from 'astro:middleware';
import { requireAdmin } from './lib/adminAuth';

/**
 * Server-side guard: the admin panel pages (/admin and everything under it,
 * except the login page itself) are only accessible to an authenticated admin.
 *
 * API routes under /api/admin perform their own requireAdmin() checks, so this
 * guard exists to stop the admin *pages* (and their bundled UI) from ever being
 * served to an anonymous visitor or an ordinary signed-in member.
 *
 * NOTE: this only takes effect if the app is rebuilt — `astro build` inlines
 * the middleware into dist/server/entry.mjs. A stale dist/ (built before this
 * file existed) will serve the admin pages unguarded.
 */
export const onRequest = defineMiddleware(async (context, next) => {
  const { pathname } = context.url;

  // Only the exact login page is public. Matching the exact path (rather than
  // a `/admin/login` prefix) stops things like `/admin/login-anything` from
  // slipping past the guard.
  const isLoginPage = pathname === '/admin/login' || pathname === '/admin/login/';

  const isAdminPage =
    pathname === '/admin' ||
    pathname === '/admin/' ||
    (pathname.startsWith('/admin/') && !isLoginPage);

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
