export const prerender = false;

import type { APIRoute } from 'astro';
import { extractBearerToken, getUserFromSession } from '@lib/auth';
import { db } from '@lib/db';
import { userSessions } from '@lib/db/schema';
import { eq } from 'drizzle-orm';

export const POST: APIRoute = async ({ request }) => {
  try {
    // Accept the session from the Bearer header or the HttpOnly cookie —
    // page JS can no longer read the token, so cookies are the norm now.
    let sessionToken = extractBearerToken(request);
    if (!sessionToken) {
      const { readCookie } = await import('@lib/auth');
      sessionToken = readCookie(request, 'token') || undefined;
    }
    const user = sessionToken ? await getUserFromSession(sessionToken) : null;

    if (user && sessionToken) {
      // Delete the session
      await db.delete(userSessions).where(eq(userSessions.token, sessionToken));
    }

    return new Response(
      JSON.stringify({ success: true, message: 'Logged out successfully' }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Set-Cookie': 'token=; Path=/; Max-Age=0; HttpOnly; SameSite=Lax',
        },
      }
    );
  } catch (error) {
    console.error('Logout error:', error);
    return new Response(
      JSON.stringify({ success: false, message: 'Logout failed' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
