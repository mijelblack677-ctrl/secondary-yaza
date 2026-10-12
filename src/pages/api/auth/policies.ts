export const prerender = false;

import type { APIRoute } from 'astro';

export const GET: APIRoute = async () => {
  return new Response(
    JSON.stringify({
      success: true,
      termsUrl: '/policies',
      privacyUrl: '/policies',
      updatedAt: '2026-10-10',
    }),
    {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    }
  );
};
