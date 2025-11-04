-- car_parts_products テーブルの price カラムを text 型に変更
ALTER TABLE car_parts_products 
ALTER COLUMN price TYPE text;

-- 確認用クエリ（オプション）
-- SELECT column_name, data_type 
-- FROM information_schema.columns 
-- WHERE table_name = 'car_parts_products' AND column_name = 'price';
