import { NextRequest, NextResponse } from 'next/server';

// Simple in-memory rate limiter.
// Works perfectly in development and single-instance deployments.
// In multi-instance serverless (Vercel), each instance has its own counter
// — still effective as a per-instance safeguard against abuse.

const LIMIT = 20;           // max requests per window
const WINDOW_MS = 60_000;   // 1 minute

const store = new Map<string, { count: number; resetAt: number }>();

export function middleware(request: NextRequest) {
  const ip =
    request.headers.get('x-forwarded-for')?.split(',')[0].trim() ||
    request.headers.get('x-real-ip') ||
    'unknown';

  const now = Date.now();
  const entry = store.get(ip);

  if (!entry || now > entry.resetAt) {
    store.set(ip, { count: 1, resetAt: now + WINDOW_MS });
    return NextResponse.next();
  }

  if (entry.count >= LIMIT) {
    const retryAfter = Math.ceil((entry.resetAt - now) / 1000);
    return NextResponse.json(
      { error: 'Troppe richieste. Riprova tra un minuto.' },
      { status: 429, headers: { 'Retry-After': String(retryAfter) } }
    );
  }

  entry.count++;
  return NextResponse.next();
}

export const config = {
  matcher: ['/api/generate/:path*', '/api/chat'],
};
