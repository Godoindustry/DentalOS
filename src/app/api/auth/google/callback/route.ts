import { NextResponse } from 'next/server';
import { handleGoogleCallback } from '@/lib/gcal';

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get('code');
  const clinicaId = url.searchParams.get('state');

  if (!code || !clinicaId) {
    return NextResponse.json({ error: 'Code ou state ausentes' }, { status: 400 });
  }

  try {
    await handleGoogleCallback(code, clinicaId);
    return NextResponse.redirect(new URL('/configuracoes', request.url));
  } catch (error) {
    console.error('Erro no callback do Google:', error);
    return NextResponse.json({ error: 'Falha ao autenticar no Google Calendar' }, { status: 500 });
  }
}
