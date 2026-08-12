import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  try {
    const supabase = await createClient();
    const { data } = await supabase.auth.getUser();
    const user = data.user;
    if (!user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const clinicaId = user.user_metadata?.clinica_id;
    if (!clinicaId) {
      return NextResponse.json({ error: "Clínica não vinculada" }, { status: 403 });
    }

    const { data: config } = await supabase
      .from("configuracoes_bot")
      .select("ativo, whatsapp, n8n_webhook_url, webhook_slug, nome_clinica")
      .eq("clinica_id", clinicaId)
      .maybeSingle();

    if (!config) {
      return NextResponse.json({ error: "Configuração do bot não encontrada" }, { status: 404 });
    }

    const webhookUrl = config.n8n_webhook_url
      ? `${process.env.NEXT_PUBLIC_SITE_URL || ""}/api/bot/n8n/${config.webhook_slug}`
      : null;

    return NextResponse.json({
      status: config.ativo ? "ativo" : "inativo",
      nome_clinica: config.nome_clinica,
      whatsapp: config.whatsapp,
      webhook_slug: config.webhook_slug,
      webhook_url: webhookUrl,
    });
  } catch (error) {
    console.error("Erro no health check do bot:", error);
    return NextResponse.json({ error: "Falha ao verificar status do bot" }, { status: 500 });
  }
}
