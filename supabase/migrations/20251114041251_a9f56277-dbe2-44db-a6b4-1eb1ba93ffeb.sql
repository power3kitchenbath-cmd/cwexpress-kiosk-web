-- Add thumbnail_url column to products table
ALTER TABLE products ADD COLUMN thumbnail_url text;

-- Add comment to document the column
COMMENT ON COLUMN products.thumbnail_url IS 'URL to 200x200px WebP thumbnail for fast grid loading';