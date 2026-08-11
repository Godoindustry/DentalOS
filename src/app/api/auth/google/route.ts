import { NextResponse } from 'next/server';
import { getGoogleAuthUrl } from '@/lib/gcal';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: Request) {
  const supabase = await createClient();
  const { data: user } = await supabase.auth.getUser();
  const clinicaId = user.user?.user_metadata?.clinica_id;

  if (!clinicaId) {
    return NextResponse.json({ error: 'Não autorizado ou clínica não encontrada.' }, { status: 401 });
  }

  const url = getGoogleAuthUrl(clinicaId);
  return NextResponse.redirect(url);
}
