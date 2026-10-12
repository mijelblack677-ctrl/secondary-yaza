import type { APIRoute } from 'astro';
import { db } from '@lib/db';
import { adminSessions } from '@lib/db/schema';
import { eq } from 'drizzle-orm';
import { clearAdminCookie } from '@lib/adminAuth';

/** Invalidate the admin session server-side and clear the HttpOnly cookie. */
export const POST: APIRoute = async ({ request }) => {
  try {
    const raw = request.headers.get('Cookie') || '';
    const match = raw.match(/(?:^|;\s*)adminToken=([^;]+)/);
    if (match) {
      const token = decodeURIComponent(match[1]);
      await db.delete(adminSessions).where(eq(adminSessions.token, token));
    }
  } catch (error) {
    console.error('Admin logout error:', error);
  }

  return new Response(
    JSON.stringify({ success: true }),
    { status: 200, headers: { 'Content-Type': 'application/json', 'Set-Cookie': clearAdminCookie() } }
  );
};

export const GET = POST;
