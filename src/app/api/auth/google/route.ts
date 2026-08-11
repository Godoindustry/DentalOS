import { NextResponse } from 'next/server';
import { getGoogleAuthUrl } from '@/lib/gcal';
import { createClient } from '@/lib/supabase/server';
import { getClinicaId } from '@/app/(dashboard)/actions';

export async function GET() {
  const supabase = await createClient();
  const clinicaId = await getClinicaId(supabase);

  if (!clinicaId) {
    return NextResponse.json({ error: 'Não autorizado ou clínica não encontrada.' }, { status: 401 });
  }

  const url = getGoogleAuthUrl(clinicaId);
  return NextResponse.redirect(url);
}
