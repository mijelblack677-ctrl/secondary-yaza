export const prerender = false;

import type { APIRoute } from 'astro';
import { extractBearerToken, getUserFromSession } from '@lib/auth';
import { db } from '@lib/db';
import { userSessions } from '@lib/db/schema';
import { eq } from 'drizzle-orm';

export const POST: APIRoute = async ({ request }) => {
  try {
    const user = await getUserFromSession(extractBearerToken(request));

    if (user) {
      // Delete the session
      await db.delete(userSessions).where(eq(userSessions.token, extractBearerToken(request)!));
    }

    return new Response(
      JSON.stringify({ success: true, message: 'Logged out successfully' }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Logout error:', error);
    return new Response(
      JSON.stringify({ success: false, message: 'Logout failed' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
