import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { join } from 'path';

const supabaseUrl = process.env.VITE_SUPABASE_URL!;
const supabaseKey = process.env.VITE_SUPABASE_PUBLISHABLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

// Product data with descriptions and pricing
const products = [
  {
    name: "Calacatta Gris",
    sku: "CAL-GRIS-2025",
    price: 85,
    category: "Countertops",
    description: "Sophisticated gray tones meet elegant veining in this stunning Calacatta variation. Perfect for modern kitchens seeking a balance between timeless marble aesthetics and contemporary color palettes.",
    imagePath: "src/assets/countertops/calacatta-gris.jpg",
    storagePath: "countertops/calacatta/calacatta-gris.jpg"
  },
  {
    name: "Calacatta Fiona",
    sku: "CAL-FIONA-2025",
    price: 90,
    category: "Countertops",
    description: "Warm undertones and bold dramatic patterns create a luxurious focal point. Fiona's distinctive veining adds character and sophistication to any space, making it ideal for statement countertops.",
    imagePath: "src/assets/countertops/calacatta-fiona.jpg",
    storagePath: "countertops/calacatta/calacatta-fiona.jpg"
  },
  {
    name: "Calacatta Nova",
    sku: "CAL-NOVA-2025",
    price: 95,
    category: "Countertops",
    description: "Classic white marble with dramatic bold veining captures the essence of traditional Italian Calacatta. Nova delivers timeless elegance with striking visual impact, perfect for high-end residential and commercial projects.",
    imagePath: "src/assets/countertops/calacatta-nova.jpg",
    storagePath: "countertops/calacatta/calacatta-nova.jpg"
  },
  {
    name: "Calacatta Venus",
    sku: "CAL-VENUS-2025",
    price: 100,
    category: "Countertops",
    description: "Soft gold accents dance across pristine marble, creating an opulent and luxurious aesthetic. Venus combines warmth with sophistication, making it the premium choice for discerning clients.",
    imagePath: "src/assets/countertops/calacatta-venus.jpg",
    storagePath: "countertops/calacatta/calacatta-venus.jpg"
  },
  {
    name: "Calacatta Bonita",
    sku: "CAL-BONITA-2025",
    price: 92,
    category: "Countertops",
    description: "Delicate patterns and refined veining create an understated elegance. Bonita's subtle beauty offers versatility, complementing both traditional and contemporary design schemes with graceful sophistication.",
    imagePath: "src/assets/countertops/calacatta-bonita.jpg",
    storagePath: "countertops/calacatta/calacatta-bonita.jpg"
  },
  {
    name: "Calacatta Ivory",
    sku: "CAL-IVORY-2025",
    price: 88,
    category: "Countertops",
    description: "Warm cream base with subtle elegant veining provides a softer alternative to stark white marble. Ivory brings inviting warmth while maintaining the classic Calacatta sophistication.",
    imagePath: "src/assets/countertops/calacatta-ivory.jpg",
    storagePath: "countertops/calacatta/calacatta-ivory.jpg"
  },
  {
    name: "Calacatta Luna",
    sku: "CAL-LUNA-2025",
    price: 93,
    category: "Countertops",
    description: "Cool tones and modern aesthetic create a contemporary interpretation of classic Calacatta. Luna's clean lines and refined veining pattern make it perfect for minimalist and modern design projects.",
    imagePath: "src/assets/countertops/calacatta-luna.jpg",
    storagePath: "countertops/calacatta/calacatta-luna.jpg"
  }
];

async function uploadProductImages() {
  console.log('Starting Calacatta product upload...');

  for (const product of products) {
    try {
      console.log(`\nProcessing ${product.name}...`);

      // Read the image file
      const imagePath = join(process.cwd(), product.imagePath);
      const imageBuffer = readFileSync(imagePath);

      // Upload to Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('product-images')
        .upload(product.storagePath, imageBuffer, {
          contentType: 'image/jpeg',
          upsert: true
        });

      if (uploadError) {
        console.error(`Upload error for ${product.name}:`, uploadError);
        continue;
      }

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('product-images')
        .getPublicUrl(product.storagePath);

      console.log(`Image uploaded: ${publicUrl}`);

      // Insert product into database
      const { data: productData, error: insertError } = await supabase
        .from('products')
        .insert({
          name: product.name,
          sku: product.sku,
          price: product.price,
          category: product.category,
          description: product.description,
          image_url: publicUrl,
          thumbnail_url: publicUrl,
          inventory_count: 100,
          inventory_status: 'in_stock',
          specifications: {
            material: 'Quartz',
            finish: 'Polished',
            thickness: '3cm',
            collection: 'Calacatta 2025'
          }
        })
        .select()
        .single();

      if (insertError) {
        console.error(`Database error for ${product.name}:`, insertError);
        continue;
      }

      console.log(`✓ Successfully added ${product.name} (ID: ${productData.id})`);

    } catch (error) {
      console.error(`Error processing ${product.name}:`, error);
    }
  }

  console.log('\n✓ Calacatta product upload complete!');
}

uploadProductImages();
