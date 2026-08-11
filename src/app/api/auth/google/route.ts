import { NextResponse } from 'next/server';
import { getGoogleAuthUrl } from '@/lib/gcal';
import { createClient } from '@/lib/supabase/server';
import { getClinicaId } from '@/app/(dashboard)/actions';
import { rateLimit, getClientIp } from '@/lib/rate-limit';

export async function GET(request: Request) {
  const clientIp = getClientIp(request)

  if (!rateLimit(`google-auth:${clientIp}`, 10, 60_000)) {
    return NextResponse.json({ error: 'Muitas requisições. Tente novamente em 1 minuto.' }, { status: 429 })
  }

  const supabase = await createClient();
  const clinicaId = await getClinicaId(supabase);

  if (!clinicaId) {
    return NextResponse.json({ error: 'Não autorizado ou clínica não encontrada.' }, { status: 401 });
  }

  const url = getGoogleAuthUrl(clinicaId);
  return NextResponse.redirect(url);
}
