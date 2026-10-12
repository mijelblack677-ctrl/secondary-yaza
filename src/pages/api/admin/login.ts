export const prerender = false;

import type { APIRoute } from 'astro';
import { db } from '@lib/db';
import { adminUsers, adminSessions } from '@lib/db/schema';
import { eq } from 'drizzle-orm';
import { verifyPassword, hashPassword } from '@lib/password';
import { generateAdminToken } from '@lib/adminAuth';

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const { username, password } = body;

    if (!username || !password) {
      return new Response(
        JSON.stringify({ success: false, message: 'Username and password are required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Find admin by username
    const result = await db
      .select()
      .from(adminUsers)
      .where(eq(adminUsers.username, username));

    if (result.length === 0) {
      return new Response(
        JSON.stringify({ success: false, message: 'Invalid username or password' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const admin = result[0];

    // Verify password
    const isValid = await verifyPassword(password, admin.passwordHash);

    if (!isValid) {
      return new Response(
        JSON.stringify({ success: false, message: 'Invalid username or password' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Check if admin is active
    if (!admin.isActive) {
      return new Response(
        JSON.stringify({ success: false, message: 'Admin account is deactivated' }),
        { status: 403, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Create new session
    const token = generateAdminToken();
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24 * 7); // 7 days

    // Delete old sessions
    await db.delete(adminSessions).where(eq(adminSessions.adminId, admin.id));

    await db.insert(adminSessions).values({
      id: crypto.randomUUID(),
      adminId: admin.id,
      token,
      expiresAt,
    });

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Admin login successful',
        admin: {
          id: admin.id,
          username: admin.username,
          email: admin.email,
          role: admin.role,
        },
        token,
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Admin login error:', error);
    return new Response(
      JSON.stringify({ success: false, message: 'Login failed' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};

// Helper to create first admin (call this once)
export async function createFirstAdmin(username: string, email: string, password: string) {
  const passwordHash = await hashPassword(password);
  
  const result = await db.insert(adminUsers).values({
    id: crypto.randomUUID(),
    username,
    email,
    passwordHash,
    role: 'superadmin',
    isActive: true,
  }).returning();

  return result[0];
}
