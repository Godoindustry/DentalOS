import { google } from 'googleapis';
import { createAdminClient } from './supabase/admin';

const CALLBACK_URL = 'http://localhost:3000/api/auth/google/callback';

export const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  CALLBACK_URL
);

export function getGoogleAuthUrl(clinicaId: string) {
  const scopes = ['https://www.googleapis.com/auth/calendar.events'];
  return oauth2Client.generateAuthUrl({
    access_type: 'offline',
    prompt: 'consent',
    scope: scopes,
    state: clinicaId,
  });
}

export async function handleGoogleCallback(code: string, clinicaId: string) {
  const { tokens } = await oauth2Client.getToken(code);
  const admin = createAdminClient();
  
  await admin.from('configuracoes_bot').update({
    google_refresh_token: tokens.refresh_token,
    google_access_token: tokens.access_token,
  }).eq('clinica_id', clinicaId);

  return tokens;
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
      calendarId: calendarId,
      requestBody: event,
    });

    return { data: res.data };
  } catch (error) {
    console.error("Erro ao criar evento no Google Calendar:", error);
    return { error };
  }
}
