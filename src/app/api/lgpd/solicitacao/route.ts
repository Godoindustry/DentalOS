import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

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
    const { paciente_id, tipo, motivo } = body;

    if (!tipo || !["exclusao", "exportacao", "atualizacao"].includes(tipo)) {
      return NextResponse.json({ error: "Tipo de solicitação inválido" }, { status: 400 });
    }

    const { error } = await createAdminClient().from("lgpd_solicitacoes").insert({
      clinica_id: clinicaId,
      paciente_id: paciente_id || null,
      tipo,
      motivo: motivo || null,
      status: "pendente",
    });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Erro na solicitação LGPD:", error);
    return NextResponse.json({ error: "Falha ao processar solicitação" }, { status: 500 });
  }
}
