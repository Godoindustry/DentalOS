import { NextResponse } from 'next/server';
import { handleGoogleCallback } from '@/lib/gcal';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get('code');
  const state = url.searchParams.get('state');

  if (!code || !state) {
    return NextResponse.redirect(new URL('/configuracoes?google=error&message=code_ou_state_ausentes', request.url));
  }

  try {
    const result = await handleGoogleCallback(code, state);

    if (result.clinicaId) {
      const supabase = await createClient();
      const { data } = await supabase.auth.getUser();
      const user = data.user;

      if (!user || user.user_metadata?.clinica_id !== result.clinicaId) {
        const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
          email: '',
          password: '',
        });
      }
    }

    return NextResponse.redirect(new URL(`/dashboard?google=connected`, request.url));
  } catch (error) {
    console.error('Erro no callback do Google:', error);
    return NextResponse.redirect(new URL('/configuracoes?google=error', request.url));
  }
}
