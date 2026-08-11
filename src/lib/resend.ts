import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendEmail({ to, subject, html }: { to: string; subject: string; html: string }) {
  if (!process.env.RESEND_API_KEY) {
    console.warn("Resend API key missing");
    return { error: "Resend API key missing" };
  }
  
  try {
    const data = await resend.emails.send({
      from: 'onboarding@resend.dev',
      to,
      subject,
      html,
    });
    return { data };
  } catch (error) {
    console.error("Erro ao enviar email pelo Resend:", error);
    return { error };
  }
}
