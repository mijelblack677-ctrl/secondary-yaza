export const prerender = false;

import type { APIRoute } from 'astro';
import { db } from '@lib/db';
import { users, userSessions } from '@lib/db/schema';
import { eq } from 'drizzle-orm';
import { verifyPassword } from '@lib/password';
import { generateToken } from '@lib/auth';

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return new Response(
        JSON.stringify({ success: false, message: 'Email and password are required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Find user by email
    const result = await db
      .select()
      .from(users)
      .where(eq(users.email, email.toLowerCase()));

    if (result.length === 0) {
      return new Response(
        JSON.stringify({ success: false, message: 'Invalid email or password' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const user = result[0];

    // Verify password
    const isValid = await verifyPassword(password, user.passwordHash);

    if (!isValid) {
      return new Response(
        JSON.stringify({ success: false, message: 'Invalid email or password' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Check if user is active
    if (!user.isActive) {
      return new Response(
        JSON.stringify({ success: false, message: 'Account is deactivated' }),
        { status: 403, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Create new session
    const token = generateToken();
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24 * 30); // 30 days

    // Delete old sessions
    await db.delete(userSessions).where(eq(userSessions.userId, user.id));

    await db.insert(userSessions).values({
      id: crypto.randomUUID(),
      userId: user.id,
      token,
      expiresAt,
    });

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Login successful',
        user: {
          id: user.id,
          fullName: user.fullName,
          email: user.email,
          isAdmin: user.isAdmin,
        },
        token,
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Login error:', error);
    return new Response(
      JSON.stringify({ success: false, message: 'Login failed' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
