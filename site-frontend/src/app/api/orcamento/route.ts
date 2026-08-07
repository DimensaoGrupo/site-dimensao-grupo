import { NextResponse } from "next/server";

type OrcamentoPayload = {
  nome: string;
  email: string;
  telefone: string;
  mensagem: string;
};

export async function POST(request: Request) {
  const body = (await request.json()) as Partial<OrcamentoPayload>;

  if (!body.nome || !body.email || !body.telefone) {
    return NextResponse.json(
      { ok: false, error: "Campos obrigatórios ausentes." },
      { status: 400 },
    );
  }

  const backendUrl = process.env.BACKEND_API_URL;

  if (backendUrl) {
    const upstream = await fetch(`${backendUrl}/orcamentos`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (!upstream.ok) {
      return NextResponse.json(
        { ok: false, error: "Não foi possível enviar sua solicitação." },
        { status: 502 },
      );
    }
  }

  return NextResponse.json({ ok: true });
}
