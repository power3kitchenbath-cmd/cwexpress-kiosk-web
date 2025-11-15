-- Add image_url and thumbnail_url columns to flooring_types table
ALTER TABLE flooring_types 
ADD COLUMN IF NOT EXISTS image_url TEXT,
ADD COLUMN IF NOT EXISTS thumbnail_url TEXT;

-- Insert 4 LVP flooring types
INSERT INTO flooring_types (name, price_per_sqft, image_url, thumbnail_url)
VALUES 
  ('LVP - Cocoa', 4.99, '/src/assets/flooring/lvp/cocoa.png', '/src/assets/flooring/lvp/cocoa.png'),
  ('LVP - Butternut', 4.99, '/src/assets/flooring/lvp/butternut.png', '/src/assets/flooring/lvp/butternut.png'),
  ('LVP - Fog', 4.99, '/src/assets/flooring/lvp/fog.png', '/src/assets/flooring/lvp/fog.png'),
  ('LVP - Blondie', 4.99, '/src/assets/flooring/lvp/blondie.png', '/src/assets/flooring/lvp/blondie.png')
ON CONFLICT (name) DO NOTHING;

-- Insert 4 LVP products into products table
INSERT INTO products (name, description, category, price, image_url, thumbnail_url, inventory_count, inventory_status, sku, specifications)
VALUES 
  (
    'LVP - Cocoa', 
    'Rich dark brown luxury vinyl plank flooring with authentic wood grain texture. Durable, waterproof, and perfect for high-traffic areas.',
    'flooring',
    4.99,
    '/src/assets/flooring/lvp/cocoa.png',
    '/src/assets/flooring/lvp/cocoa.png',
    500,
    'in_stock',
    'LVP-COCOA',
    '{"finish": "matte", "thickness": "8mm", "wear_layer": "20mil", "installation": "click-lock", "warranty": "lifetime residential"}'::jsonb
  ),
  (
    'LVP - Butternut',
    'Warm light tan luxury vinyl plank with natural wood character. Easy to maintain and install, ideal for any room.',
    'flooring',
    4.99,
    '/src/assets/flooring/lvp/butternut.png',
    '/src/assets/flooring/lvp/butternut.png',
    500,
    'in_stock',
    'LVP-BUTTERNUT',
    '{"finish": "matte", "thickness": "8mm", "wear_layer": "20mil", "installation": "click-lock", "warranty": "lifetime residential"}'::jsonb
  ),
  (
    'LVP - Fog',
    'Sophisticated light gray luxury vinyl plank with subtle grain detail. Modern style meets practical durability.',
    'flooring',
    4.99,
    '/src/assets/flooring/lvp/fog.png',
    '/src/assets/flooring/lvp/fog.png',
    500,
    'in_stock',
    'LVP-FOG',
    '{"finish": "matte", "thickness": "8mm", "wear_layer": "20mil", "installation": "click-lock", "warranty": "lifetime residential"}'::jsonb
  ),
  (
    'LVP - Blondie',
    'Ultra-light luxury vinyl plank with airy, contemporary appeal. Brightens spaces while providing exceptional performance.',
    'flooring',
    4.99,
    '/src/assets/flooring/lvp/blondie.png',
    '/src/assets/flooring/lvp/blondie.png',
    500,
    'in_stock',
    'LVP-BLONDIE',
    '{"finish": "matte", "thickness": "8mm", "wear_layer": "20mil", "installation": "click-lock", "warranty": "lifetime residential"}'::jsonb
  )
ON CONFLICT (sku) DO NOTHING;