import { google } from 'googleapis';
import { createAdminClient } from './supabase/admin';
import { createClient } from './supabase/server';

const CALLBACK_URL = process.env.GOOGLE_REDIRECT_URI || 'http://localhost:3000/api/auth/google/callback';

export const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  CALLBACK_URL
);

export function getGoogleAuthUrl(redirectAfterAuth: string, baseUrl: string) {
  const scopes = [
    'https://www.googleapis.com/auth/calendar.events',
    'https://www.googleapis.com/auth/userinfo.email',
    'https://www.googleapis.com/auth/userinfo.profile',
  ];
  return oauth2Client.generateAuthUrl({
    access_type: 'offline',
    prompt: 'consent',
    scope: scopes,
    state: JSON.stringify({ redirect: redirectAfterAuth, baseUrl }),
  });
}

export async function handleGoogleCallback(code: string, state: string) {
  let redirectAfterAuth = '/dashboard';
  let baseUrl = '';

  try {
    const parsed = JSON.parse(state);
    redirectAfterAuth = parsed.redirect || '/dashboard';
    baseUrl = parsed.baseUrl || '';
  } catch {
    // state legado (apenas clinicaId)
  }

  const { tokens } = await oauth2Client.getToken(code);

  const admin = createAdminClient();

  if (!tokens.access_token) {
    throw new Error('Token de acesso não recebido do Google');
  }

  const userInfoRes = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
    headers: { Authorization: `Bearer ${tokens.access_token}` },
  });

  if (!userInfoRes.ok) {
    throw new Error('Falha ao obter dados do usuário Google');
  }

  const userInfo = await userInfoRes.json();
  const email = userInfo.email;
  const nome = userInfo.name || email.split('@')[0];

  if (!email) {
    throw new Error('E-mail não fornecido pelo Google');
  }

  const { data: existingUser } = await admin.auth.admin.listUsers();
  const authUser = existingUser?.users?.find((u) => u.email === email);

  let clinicaId: string | undefined;

  if (authUser) {
    clinicaId = authUser.user_metadata?.clinica_id as string | undefined;
  } else {
    const { data: newClinica } = await admin
      .from('clinicas')
      .insert({ nome_fantasia: `Clínica de ${nome}`, plano_assinatura: 'basic' })
      .select('id')
      .single();

    if (!newClinica) {
      throw new Error('Falha ao criar clínica para novo usuário Google');
    }

    clinicaId = newClinica.id;

    const { data: newAuthUser, error: authError } = await admin.auth.admin.createUser({
      email,
      email_confirm: true,
      user_metadata: { nome, clinica_id: clinicaId, role: 'titular' },
    });

    if (authError || !newAuthUser?.user) {
      await admin.from('clinicas').delete().eq('id', clinicaId);
      throw new Error(authError?.message || 'Falha ao criar usuário no Supabase Auth');
    }

    await admin.from('profissionais').insert({
      clinica_id: clinicaId,
      user_id: newAuthUser.user.id,
      nome,
      role: 'titular',
    });
  }

  if (baseUrl && clinicaId) {
    await admin.from('configuracoes_bot').update({
      google_refresh_token: tokens.refresh_token,
      google_access_token: tokens.access_token,
    }).eq('clinica_id', clinicaId);
  }

  return { tokens, redirectAfterAuth, clinicaId };
}

export async function createGoogleCalendarEvent({
  clinicaId,
  calendarId,
  summary,
  description,
  startTime,
  endTime,
}: {
  clinicaId: string;
  calendarId: string;
  summary: string;
  description: string;
  startTime: Date;
  endTime: Date;
}) {
  if (!calendarId) return { error: "Calendar ID não configurado no bot." };

  const admin = createAdminClient();
  const { data: config } = await admin
    .from('configuracoes_bot')
    .select('google_refresh_token, google_access_token')
    .eq('clinica_id', clinicaId)
    .single();

  if (!config || !config.google_refresh_token) {
    return { error: "Google Calendar não autenticado para esta clínica (sem refresh_token)." };
  }

  oauth2Client.setCredentials({
    refresh_token: config.google_refresh_token,
    access_token: config.google_access_token,
  });

  const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

  try {
    const event = {
      summary,
      description,
      start: {
        dateTime: startTime.toISOString(),
        timeZone: 'America/Sao_Paulo',
      },
      end: {
        dateTime: endTime.toISOString(),
        timeZone: 'America/Sao_Paulo',
      },
    };

    const res = await calendar.events.insert({
      calendarId,
      requestBody: event,
    });

    return { data: res.data };
  } catch (error) {
    console.error("Erro ao criar evento no Google Calendar:", error);
    return { error };
  }
}

