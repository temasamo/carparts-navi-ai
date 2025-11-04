import { supabase } from "@/lib/supabaseClient";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

export async function POST(req: Request) {
  try {
    const { query } = await req.json();

    if (!query) {
      return Response.json({ error: "Missing query" }, { status: 400 });
    }

    // --- Step1: ChatGPTで車種情報を抽出 ---
    const extractionPrompt = `
以下の日本語文章から、「メーカー名」「車種名」「年式」を抽出してください。
出力はJSON形式で:
{"maker": "...", "model": "...", "year": "...."} のみを返してください。

入力文: ${query}
    `;

    const extractionRes = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: extractionPrompt }],
      temperature: 0,
    });

    const rawText = extractionRes.choices[0].message?.content || "{}";
    let carInfo = { maker: "", model: "", year: "" };

    try {
      carInfo = JSON.parse(rawText);
    } catch {
      console.warn("⚠️ JSON parse error:", rawText);
    }

    console.log("🚗 抽出結果:", carInfo);

    // --- Step2: Supabaseでfitment検索 ---
    const { data: fitments, error: fitError } = await supabase
      .from("car_fitments")
      .select("*")
      .ilike("model", `%${carInfo.model}%`);

    if (fitError) {
      console.error("❌ fitments検索エラー:", fitError.message);
      return Response.json({ error: "fitments search failed" }, { status: 500 });
    }

    if (!fitments || fitments.length === 0) {
      return Response.json({
        answer: `該当するオイルフィルターが見つかりませんでした。車種名をもう少し詳しく教えてください（例：「プリウス 2015年式」）。`,
      });
    }

    // --- Step3: JOINして商品情報を取得 ---
    const productIds = fitments.map((f) => f.product_id);

    const { data: products, error: prodError } = await supabase
      .from("car_parts_products")
      .select("*")
      .in("id", productIds);

    if (prodError) {
      console.error("❌ products検索エラー:", prodError.message);
      return Response.json({ error: "products search failed" }, { status: 500 });
    }

    if (!products || products.length === 0) {
      return Response.json({
        answer: "該当する商品データが見つかりませんでした。",
      });
    }

    // --- Step4: レスポンス整形 ---
    const results = products.map((p) => ({
      name: p.product_name,
      price: p.price,
      url: p.url || "（URL未設定）",
    }));

    const answer =
      results.length === 1
        ? `「${carInfo.model}」には ${results[0].name}（${results[0].price}）が適合します。`
        : `${carInfo.model}に適合するオイルフィルターは以下の通りです：\n\n${results
            .map((r) => `・${r.name}（${r.price}）`)
            .join("\n")}`;

    return Response.json({
      status: "ok",
      carInfo,
      results,
      answer,
    });
  } catch (error: any) {
    console.error("❌ Unexpected error:", error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}
