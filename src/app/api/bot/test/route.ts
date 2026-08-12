import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { sendWhatsAppMessage } from "@/lib/zapi";

export async function POST(request: Request) {
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

    const body = await request.json().catch(() => ({}));
    const { phone, message } = body;

    if (!phone || !message) {
      return NextResponse.json({ error: "Informe phone e message" }, { status: 400 });
    }

    const { data: botConfig } = await supabase
      .from("configuracoes_bot")
      .select("whatsapp, ativo")
      .eq("clinica_id", clinicaId)
      .maybeSingle();

    if (!botConfig?.ativo) {
      return NextResponse.json({ error: "Bot inativo" }, { status: 403 });
    }

    const result = await sendWhatsAppMessage(phone, message);

    if (result.error) {
      return NextResponse.json({ error: result.error }, { status: 500 });
    }

    return NextResponse.json({ success: true, data: result.data });
  } catch (error) {
    console.error("Erro no teste de envio WhatsApp:", error);
    return NextResponse.json({ error: "Falha ao enviar mensagem de teste" }, { status: 500 });
  }
}
