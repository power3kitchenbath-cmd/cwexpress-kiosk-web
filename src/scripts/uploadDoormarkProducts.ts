import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { join } from 'path';

const supabaseUrl = process.env.VITE_SUPABASE_URL!;
const supabaseKey = process.env.VITE_SUPABASE_PUBLISHABLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

const products = [
  {
    name: 'Doormark Shaker Abacoa',
    sku: 'DOOR-SHAKER-ABACOA',
    price: 45.99,
    description: 'Classic white shaker style cabinet door with clean lines and traditional appeal. Perfect for modern and transitional kitchens.',
    category: 'Cabinet Doors & Drawers',
    imagePath: 'src/assets/cabinet-doors/doormark-shaker-abacoa.png',
    storagePath: 'cabinet-doors/doormark-shaker-abacoa.png',
    specifications: {
      brand: 'Doormark',
      style: 'Shaker',
      finish: 'White',
      material: 'MDF',
      origin: 'South Florida'
    }
  },
  {
    name: 'Doormark Bal Harbor',
    sku: 'DOOR-BAL-HARBOR',
    price: 52.99,
    description: 'Light natural wood grain finish with vertical pattern. Brings warmth and natural beauty to any kitchen space.',
    category: 'Cabinet Doors & Drawers',
    imagePath: 'src/assets/cabinet-doors/doormark-bal-harbor.png',
    storagePath: 'cabinet-doors/doormark-bal-harbor.png',
    specifications: {
      brand: 'Doormark',
      style: 'Contemporary',
      finish: 'Natural Wood',
      material: 'Wood Veneer',
      origin: 'South Florida'
    }
  },
  {
    name: 'Doormark Capris',
    sku: 'DOOR-CAPRIS',
    price: 49.99,
    description: 'Sophisticated dark charcoal gray finish with smooth slab design. Modern and sleek for contemporary kitchens.',
    category: 'Cabinet Doors & Drawers',
    imagePath: 'src/assets/cabinet-doors/doormark-capris.png',
    storagePath: 'cabinet-doors/doormark-capris.png',
    specifications: {
      brand: 'Doormark',
      style: 'Slab',
      finish: 'Charcoal Gray',
      material: 'MDF',
      origin: 'South Florida'
    }
  },
  {
    name: 'Doormark Biscayne',
    sku: 'DOOR-BISCAYNE',
    price: 54.99,
    description: 'Rich wood grain with elegant vertical detail lines. Traditional design with timeless appeal.',
    category: 'Cabinet Doors & Drawers',
    imagePath: 'src/assets/cabinet-doors/doormark-biscayne.png',
    storagePath: 'cabinet-doors/doormark-biscayne.png',
    specifications: {
      brand: 'Doormark',
      style: 'Traditional',
      finish: 'Wood Stain',
      material: 'Solid Wood',
      origin: 'South Florida'
    }
  },
  {
    name: 'Doormark Euro Shaker',
    sku: 'DOOR-EURO-SHAKER',
    price: 47.99,
    description: 'European-inspired shaker design with clean lines and minimalist aesthetic. Perfect for modern spaces.',
    category: 'Cabinet Doors & Drawers',
    imagePath: 'src/assets/cabinet-doors/doormark-euro-shaker.png',
    storagePath: 'cabinet-doors/doormark-euro-shaker.png',
    specifications: {
      brand: 'Doormark',
      style: 'Euro Shaker',
      finish: 'White',
      material: 'MDF',
      origin: 'South Florida'
    }
  },
  {
    name: 'Doormark Holly Hill',
    sku: 'DOOR-HOLLY-HILL',
    price: 43.99,
    description: 'Bright white flat panel door with subtle frame detail. Versatile design works with any kitchen style.',
    category: 'Cabinet Doors & Drawers',
    imagePath: 'src/assets/cabinet-doors/doormark-holly-hill.png',
    storagePath: 'cabinet-doors/doormark-holly-hill.png',
    specifications: {
      brand: 'Doormark',
      style: 'Flat Panel',
      finish: 'White',
      material: 'MDF',
      origin: 'South Florida'
    }
  }
];

async function uploadProductImages() {
  console.log('Starting Doormark product upload...');

  for (const product of products) {
    try {
      // Read the local image file
      const imagePath = join(process.cwd(), product.imagePath);
      const imageBuffer = readFileSync(imagePath);

      // Upload to Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('product-images')
        .upload(product.storagePath, imageBuffer, {
          contentType: 'image/png',
          upsert: true
        });

      if (uploadError) {
        console.error(`Error uploading ${product.name}:`, uploadError);
        continue;
      }

      // Get the public URL
      const { data: { publicUrl } } = supabase.storage
        .from('product-images')
        .getPublicUrl(product.storagePath);

      // Insert product into database
      const { error: insertError } = await supabase
        .from('products')
        .insert({
          name: product.name,
          sku: product.sku,
          price: product.price,
          description: product.description,
          category: product.category,
          image_url: publicUrl,
          thumbnail_url: publicUrl,
          inventory_count: 100,
          inventory_status: 'in_stock',
          specifications: product.specifications
        });

      if (insertError) {
        console.error(`Error inserting ${product.name}:`, insertError);
        continue;
      }

      console.log(`✓ Successfully uploaded and created product: ${product.name}`);
    } catch (error) {
      console.error(`Error processing ${product.name}:`, error);
    }
  }

  console.log('Doormark product upload complete!');
}

uploadProductImages();
