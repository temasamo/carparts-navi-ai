#!/usr/bin/env python3
"""
YORO STORE オイルフィルタースクレイピングスクリプト
実行: python scripts/scrape_yoro_oilfilters.py
出力: app/data/fitment_oilfilters.json
"""

import requests
from bs4 import BeautifulSoup
import json
import time
import os
from urllib.parse import urljoin

BASE_URL = "https://www.yoro-store.com"
# オイルフィルターカテゴリーページ（実際のURLに要調整）
CATEGORY_URL = f"{BASE_URL}/product-category/oil-filter/"

def scrape_products():
    """オイルフィルター商品一覧を取得"""
    print(f"📦 カテゴリーページを取得中: {CATEGORY_URL}")
    res = requests.get(CATEGORY_URL, headers={
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
    })
    res.raise_for_status()
    
    soup = BeautifulSoup(res.text, "html.parser")
    items = []
    
    # 商品リンクを取得（実際のHTML構造に合わせて要調整）
    product_links = soup.select(".product-item a, .product-title a, .woocommerce-loop-product__link")
    
    if not product_links:
        # フォールバック: すべてのリンクから商品ページを探す
        all_links = soup.select("a[href*='pid='], a[href*='product']")
        product_links = all_links[:50]  # 最初の50件を取得
    
    print(f"🔍 {len(product_links)}件の商品リンクを発見")
    
    for idx, link in enumerate(product_links, 1):
        href = link.get("href", "")
        if not href:
            continue
        
        # 相対URLを絶対URLに変換
        if href.startswith("/"):
            url = urljoin(BASE_URL, href)
        elif not href.startswith("http"):
            url = urljoin(BASE_URL, href)
        else:
            url = href
        
        print(f"  [{idx}/{len(product_links)}] 処理中: {url}")
        
        try:
            product = scrape_product_detail(url)
            if product:
                items.append(product)
                print(f"    ✅ 取得成功: {product['product_name'][:50]}...")
            else:
                print(f"    ⚠️  スキップ（データ不十分）")
        except Exception as e:
            print(f"    ❌ エラー: {e}")
        
        # アクセス頻度制限（2-3秒間隔）
        time.sleep(2.5)
    
    return items

def scrape_product_detail(url):
    """商品詳細ページから情報を取得"""
    res = requests.get(url, headers={
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
    })
    res.raise_for_status()
    
    soup = BeautifulSoup(res.text, "html.parser")
    
    # 商品名を取得
    name_elem = soup.select_one("h1, .product-title, .entry-title")
    if not name_elem:
        return None
    product_name = name_elem.text.strip()
    
    # 価格を取得
    price_elem = soup.select_one(".price, .woocommerce-Price-amount, .product-price")
    price = price_elem.text.strip() if price_elem else "価格不明"
    
    # 適合車種テーブルを取得
    fitments = []
    
    # テーブルから適合情報を抽出
    tables = soup.select("table, .fitment-table, .compatibility-table")
    for table in tables:
        rows = table.select("tr")
        for row in rows[1:]:  # ヘッダー行をスキップ
            cols = [c.text.strip() for c in row.select("td, th")]
            if len(cols) >= 4:
                fitments.append({
                    "maker": cols[0] if len(cols) > 0 else "",
                    "model": cols[1] if len(cols) > 1 else "",
                    "engine": cols[2] if len(cols) > 2 else "",
                    "year_range": cols[3] if len(cols) > 3 else ""
                })
    
    # テーブルが見つからない場合、リスト形式を試す
    if not fitments:
        fitment_lists = soup.select(".fitment-list, .compatibility-list, ul.fitment")
        for fitment_list in fitment_lists:
            items = fitment_list.select("li")
            for item in items:
                text = item.text.strip()
                # 「メーカー 車種 エンジン 年式」形式を想定
                parts = text.split()
                if len(parts) >= 4:
                    fitments.append({
                        "maker": parts[0],
                        "model": parts[1],
                        "engine": parts[2],
                        "year_range": parts[3]
                    })
    
    return {
        "product_name": product_name,
        "price": price,
        "url": url,
        "fitments": fitments
    }

def main():
    """メイン処理"""
    print("🚀 YORO STORE オイルフィルタースクレイピング開始\n")
    
    try:
        data = scrape_products()
        
        # 出力ディレクトリを確認
        output_dir = "data"
        os.makedirs(output_dir, exist_ok=True)
        
        output_path = os.path.join(output_dir, "fitment_oilfilters.json")
        
        with open(output_path, "w", encoding="utf-8") as f:
            json.dump(data, f, ensure_ascii=False, indent=2)
        
        print(f"\n✅ 完了: {len(data)}件の商品を {output_path} に出力しました")
        
    except Exception as e:
        print(f"\n❌ エラーが発生しました: {e}")
        raise

if __name__ == "__main__":
    main()
