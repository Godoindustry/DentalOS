import { NextResponse } from 'next/server';
import { getGoogleAuthUrl } from '@/lib/gcal';

export async function GET(request: Request) {
  const url = new URL(request.url);
  const baseUrl = request.headers.get('origin') || url.origin;

  const redirectAfterAuth = url.searchParams.get('redirect') || '/configuracoes';
  const authUrl = getGoogleAuthUrl(redirectAfterAuth, baseUrl);

  return NextResponse.redirect(authUrl);
}
