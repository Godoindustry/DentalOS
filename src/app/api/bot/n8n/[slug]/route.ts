import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { createHmac, timingSafeEqual } from "crypto";
import { rateLimit, getClientIp } from "@/lib/rate-limit";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    console.log(`[n8n-webhook] Recebida requisição para slug: ${slug}`);

    const clientIp = getClientIp(request)
    if (!rateLimit(`n8n-webhook:${clientIp}`, 60, 60_000)) {
      return NextResponse.json({ error: "Muitas requisições" }, { status: 429 })
    }

    // Autenticação é via assinatura HMAC (abaixo), não sessão de usuário —
    // esta chamada vem do n8n, sem cookies de login. Precisa do client
    // admin (service role) para não esbarrar em RLS.
    const supabase = createAdminClient();

    const { data: config, error: configError } = await supabase
      .from("configuracoes_bot")
      .select("clinica_id, n8n_webhook_secret, ativo, webhook_slug, nome_clinica")
      .eq("webhook_slug", slug)
      .maybeSingle();

    console.log(`[n8n-webhook] Config encontrada:`, config ? { slug: config.webhook_slug, clinica_id: config.clinica_id, ativo: config.ativo } : "null");

    if (configError || !config?.webhook_slug) {
      console.log(`[n8n-webhook] Webhook não encontrado para slug: ${slug}`);
      return NextResponse.json({ error: "Webhook não encontrado" }, { status: 404 });
    }

    if (!config.ativo) {
      console.log(`[n8n-webhook] Bot inativo para slug: ${slug}`);
      return NextResponse.json({ error: "Bot inativo para esta clínica" }, { status: 403 });
    }

    const body = await request.text();
    const signature = request.headers.get("x-n8n-signature") || request.headers.get("x-webhook-signature") || "";
    console.log(`[n8n-webhook] Signature recebida: ${signature ? "sim" : "não"}`);

    if (config.n8n_webhook_secret && signature) {
      const expectedSignature = createHmac("sha256", config.n8n_webhook_secret)
        .update(body)
        .digest("hex");
      const signatureBuf = Buffer.from(signature, "hex")
      const expectedBuf = Buffer.from(expectedSignature, "hex")
      const isValid = signatureBuf.length === expectedBuf.length && timingSafeEqual(signatureBuf, expectedBuf)
      if (!isValid) {
        console.log(`[n8n-webhook] Assinatura inválida`);
        return NextResponse.json({ error: "Assinatura inválida" }, { status: 403 });
      }
      console.log(`[n8n-webhook] Assinatura válida`);
    }

    const payload = JSON.parse(body);
    const { sender_id, message, message_id, canal = "whatsapp", etapa, intencao, urgencia, resposta_bot } = payload;
    console.log(`[n8n-webhook] Payload processado:`, { sender_id, message: message?.slice(0, 50), message_id, intencao });

    if (!sender_id || !message) {
      return NextResponse.json({ error: "Campos obrigatórios faltando" }, { status: 400 });
    }

    const clinicaId = config.clinica_id;

    const { data: existente } = await supabase
      .from("bot_mensagens_processadas")
      .select("id")
      .eq("idempotency_key", message_id || `${sender_id}:${Date.now()}`)
      .maybeSingle();

    if (existente) {
      console.log(`[n8n-webhook] Mensagem já processada: ${message_id}`);
      return NextResponse.json({ success: true, message: "Mensagem já processada" });
    }

    let pacientePotencialId: string | null = null;
    const { data: potencial } = await supabase
      .from("pacientes_potenciais")
      .select("id, status")
      .eq("telefone", sender_id)
      .eq("clinica_id", clinicaId)
      .maybeSingle();

    if (potencial) {
      console.log(`[n8n-webhook] Paciente potencial encontrado: ${potencial.id}, status atual: ${potencial.status}`);
      pacientePotencialId = potencial.id;
      const { error: updateError } = await supabase
        .from("pacientes_potenciais")
        .update({
          status: intencao === "agendamento" ? "lead_agendamento" : potencial.status === "novo_lead" ? "lead_em_conversa" : potencial.status,
          ultima_interacao: new Date().toISOString(),
          ultima_mensagem: message.slice(0, 500),
          etapa_atual: etapa || "",
        })
        .eq("id", potencial.id);
      if (updateError) console.error("[n8n-webhook] Erro ao atualizar paciente potencial:", updateError);
    } else {
      console.log(`[n8n-webhook] Criando novo paciente potencial para: ${sender_id}`);
      const { data: novoPotencial, error: insertError } = await supabase
        .from("pacientes_potenciais")
        .insert({
          clinica_id: clinicaId,
          nome: `Contato ${sender_id.slice(-4)}`,
          telefone: sender_id,
          canal,
          status: "novo_lead",
          ultima_interacao: new Date().toISOString(),
          ultima_mensagem: message.slice(0, 500),
          etapa_atual: etapa || "inicio",
        })
        .select("id")
        .single();
      if (insertError) console.error("[n8n-webhook] Erro ao criar paciente potencial:", insertError);
      pacientePotencialId = novoPotencial?.id || null;
    }

    const { error: conversaError } = await supabase.from("conversas_bot").insert({
      clinic_id: String(clinicaId),
      paciente_potencial_id: pacientePotencialId,
      canal,
      sender_id,
      mensagem_usuario: message.slice(0, 5000),
      resposta_bot: resposta_bot || "",
      intencao: intencao || "desconhecido",
      urgencia: urgencia || "nao_aplicavel",
      etapa: etapa || "",
      raw_json: payload,
    });

    if (conversaError) console.error("[n8n-webhook] Erro ao salvar conversa:", conversaError);

    const idempotencyKey = message_id || `${sender_id}:${Date.now()}`;
    await supabase.from("bot_mensagens_processadas").insert({
      idempotency_key: idempotencyKey,
      canal,
      sender_id,
      message_id: message_id,
      clinic_id: String(clinicaId),
    });

    console.log(`[n8n-webhook] Processado com sucesso:`, { slug, sender_id, paciente_potencial_id: pacientePotencialId });

    return NextResponse.json({ success: true, paciente_potencial_id: pacientePotencialId });
  } catch (error) {
    console.error("[n8n-webhook] Erro geral:", error);
    return NextResponse.json({ error: "Falha ao processar webhook" }, { status: 500 });
  }
}
