import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q") || "";

  // ヨロストの主要カテゴリーマッピング
  const partMap: Record<string, string> = {
    "オイルフィルター": "oil-filter",
    "エアフィルター": "air-filter",
    "キャビンフィルター": "cabin-filter",
    "ブレーキパッド": "brake-pad",
    "ワイパー": "wiper",
    "プラグ": "spark-plug",
    "バッテリー": "battery",
    "ATF": "atf",
    "エンジンオイル": "engine-oil",
  };

  // 入力文字列からカテゴリを特定
  let category = "";
  for (const key in partMap) {
    if (q.includes(key)) {
      category = partMap[key];
      break;
    }
  }

  // カテゴリーページURLを決定
  const baseUrl = category
    ? `https://www.yoro-store.com/product-category/${category}/`
    : `https://www.yoro-store.com/`;

  // もしもアフィリエイト経由URL（画像から取得したIDを使用）
  const affiliateUrl = `https://af.moshimo.com/af/c/click?a_id=5205457&p_id=5797&pc_id=16051&pl_id=74384&m_url=${encodeURIComponent(baseUrl)}`;

  return NextResponse.redirect(affiliateUrl);
}
