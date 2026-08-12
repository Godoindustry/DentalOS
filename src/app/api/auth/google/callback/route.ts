import { NextResponse } from 'next/server';
import { handleGoogleCallback } from '@/lib/gcal';
import { createClient } from '@/lib/supabase/server';
import { rateLimit, getClientIp } from '@/lib/rate-limit';

export async function GET(request: Request) {
  const clientIp = getClientIp(request)

  if (!rateLimit(`google-callback:${clientIp}`, 10, 60_000)) {
    return NextResponse.json({ error: 'Muitas requisições. Tente novamente em 1 minuto.' }, { status: 429 })
  }

  const url = new URL(request.url);
  const code = url.searchParams.get('code');
  const state = url.searchParams.get('state');

  if (!code || !state) {
    return NextResponse.json({ error: 'Code ou state ausentes' }, { status: 400 });
  }

  try {
    const supabase = await createClient();
    const { data } = await supabase.auth.getUser();
    const user = data.user;

    if (!user) {
      return NextResponse.redirect(new URL('/login?error=unauthorized', request.url));
    }

    const userClinicaId = user.user_metadata?.clinica_id;
    if (!userClinicaId || userClinicaId !== state) {
      return NextResponse.json({ error: 'State inválido ou clínica não autorizada' }, { status: 403 });
    }

    await handleGoogleCallback(code, state);
    return NextResponse.redirect(new URL('/configuracoes?google=connected', request.url));
  } catch (error) {
    console.error('Erro no callback do Google:', error);
    return NextResponse.json({ error: 'Falha ao autenticar no Google Calendar' }, { status: 500 });
  }
}
