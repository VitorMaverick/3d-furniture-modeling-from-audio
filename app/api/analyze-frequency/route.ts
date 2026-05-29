import { NextRequest, NextResponse } from "next/server";
import { analyzeFrequencyImage } from "@/lib/ai-wave-provider";

const ALLOWED_TYPES = new Set(["image/jpeg", "image/jpg", "image/png", "image/webp"]);
const MAX_SIZE = 5 * 1024 * 1024;

export async function POST(request: NextRequest) {
  try {
    let formData: FormData;
    try {
      formData = await request.formData();
    } catch {
      return NextResponse.json({ error: "Imagem não fornecida." }, { status: 400 });
    }

    const file = formData.get("image") as File | null;
    const audioParamsStr = formData.get("audioParams") as string | null;
    
    // Parse dos parametros do Python (opcional)
    let audioParams: Record<string, unknown> | undefined = undefined;
    if (audioParamsStr) {
      try {
        audioParams = JSON.parse(audioParamsStr);
      } catch {
        /* ignora JSON invalido */
      }
    }

    if (!file) {
      return NextResponse.json({ error: "Imagem não fornecida." }, { status: 400 });
    }
    if (!ALLOWED_TYPES.has(file.type)) {
      return NextResponse.json(
        { error: `Formato não suportado: ${file.type}. Use PNG, JPG ou WebP.` },
        { status: 400 }
      );
    }
    if (file.size > MAX_SIZE) {
      return NextResponse.json(
        { error: "Imagem muito grande. Máximo: 5MB." },
        { status: 400 }
      );
    }

    const buffer = await file.arrayBuffer();
    const imageBase64 = Buffer.from(buffer).toString("base64");

    const result = await analyzeFrequencyImage(imageBase64, file.type, audioParams);
    return NextResponse.json(result);
  } catch (err) {
    console.error("[analyze-frequency]", err);
    return NextResponse.json({ error: "Erro ao processar imagem." }, { status: 500 });
  }
}
