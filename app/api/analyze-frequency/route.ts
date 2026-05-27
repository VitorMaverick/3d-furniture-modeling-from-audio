import { NextRequest, NextResponse } from "next/server";
import { analyzeFrequencyImage } from "@/lib/ai-wave-provider";

const ALLOWED_TYPES = new Set(["image/jpeg", "image/jpg", "image/png", "image/webp"]);
const MAX_SIZE = 5 * 1024 * 1024;

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("image") as File | null;

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

    const result = await analyzeFrequencyImage(imageBase64, file.type);
    return NextResponse.json(result);
  } catch (err) {
    console.error("[analyze-frequency]", err);
    return NextResponse.json({ error: "Erro ao processar imagem." }, { status: 500 });
  }
}
