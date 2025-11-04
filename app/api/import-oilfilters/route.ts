import { supabase } from "@/lib/supabaseClient";
import oilfilters from "@/data/fitment_oilfilters.json";

export async function POST() {
  try {
    let count = 0;

    for (const item of oilfilters) {
      // --- car_parts_products に登録 ---
      const { data: product, error: productError } = await supabase
        .from("car_parts_products")
        .insert({
          product_name: item.product_name,
          price: item.price,
          url: item.url,
          description: (item as any).description || null
        })
        .select()
        .single();

      if (productError) {
        console.error("❌ product insert error:", productError.message);
        continue;
      }

      // --- car_fitments に登録 ---
      for (const fit of item.fitments) {
        const { error: fitError } = await supabase.from("car_fitments").insert({
          product_id: product.id,
          maker: fit.maker,
          model: fit.model,
          engine: fit.engine,
          year_range: fit.year_range
        });
        if (fitError) {
          console.error("⚠️ fitment insert error:", fitError.message);
        }
      }

      count++;
    }

    return Response.json({ status: "ok", inserted: count });
  } catch (e: any) {
    console.error("Import error:", e.message);
    return Response.json({ status: "error", message: e.message });
  }
}
