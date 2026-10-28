import { Product, Category, Brand } from '@/types';
import { supabase, supabaseAdmin, isSupabaseConfigured } from './supabase';
import fs from 'fs';
import path from 'path';

// Map database row (snake_case) to Product interface (camelCase)
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function mapDbProduct(row: any): Product {
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    sku: row.sku,
    categoryId: row.category_id || '',
    categoryName: row.category_name || 'Office Supplies',
    subcategoryId: row.subcategory_id,
    subcategoryName: row.subcategory_name,
    brandId: row.brand_id || '',
    brandName: row.brand_name || 'OfficeBazzar',
    description: row.description || '',
    shortDescription: row.short_description,
    specifications: row.specifications || {},
    price: row.price !== null && row.price !== undefined ? Number(row.price) : null,
    mrp: row.mrp !== null && row.mrp !== undefined ? Number(row.mrp) : null,
    gstPercent: Number(row.gst_percent || 18),
    hsnCode: row.hsn_code,
    stockQuantity: Number(row.stock_quantity || 0),
    minOrderQuantity: Number(row.min_order_quantity || 1),
    packSize: row.pack_size || '1 Unit',
    images: Array.isArray(row.images)
      ? row.images.filter((img: unknown) => typeof img === 'string' && img.length > 0)
      : typeof row.images === 'string' && row.images.trim().length > 0
      ? (() => {
          try {
            const parsed = JSON.parse(row.images);
            return Array.isArray(parsed) ? parsed.filter(Boolean) : [row.images];
          } catch {
            return [row.images];
          }
        })()
      : [],
    featured: Boolean(row.is_featured),
    bestseller: Boolean(row.is_bestseller),
    rating: row.rating !== null && row.rating !== undefined ? Number(row.rating) : null,
    reviewCount: Number(row.review_count || 0),
    isPriceVerified: Boolean(row.is_price_verified),
    requiresManualReview: Boolean(row.requires_manual_review ?? true),
    isActive: row.is_active !== false,
    metaTitle: row.meta_title,
    metaDescription: row.meta_description,
  };
}

// Fallback in-memory / local disk cache for development or offline usage
let memoryProducts: Product[] = [];

function getDiskCustomProducts(): Product[] {
  try {
    const filePath = path.join(process.cwd(), 'src', 'lib', 'data', 'custom_products.json');
    if (fs.existsSync(filePath)) {
      const raw = fs.readFileSync(filePath, 'utf-8');
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch {
    // Ignore error
  }
  return [];
}

function saveDiskCustomProducts(products: Product[]) {
  try {
    const filePath = path.join(process.cwd(), 'src', 'lib', 'data', 'custom_products.json');
    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(filePath, JSON.stringify(products, null, 2), 'utf-8');
  } catch {
    // Ignore error
  }
}

// Ensure initial memory is seeded from disk
if (memoryProducts.length === 0) {
  memoryProducts = getDiskCustomProducts();
}

/**
 * Fetch all products for admin view (both active published and private drafts)
 */
export async function getAdminProducts(): Promise<Product[]> {
  if (isSupabaseConfigured && (supabaseAdmin || supabase)) {
    try {
      const client = supabaseAdmin || supabase!;
      const { data, error } = await client
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });

      if (!error && data && data.length > 0) {
        return data.map(mapDbProduct);
      }
    } catch {
      // Fallback
    }
  }

  return [...memoryProducts];
}

/**
 * Retrieve a single product by ID
 */
export async function getProductById(id: string): Promise<Product | null> {
  if (isSupabaseConfigured && (supabaseAdmin || supabase)) {
    try {
      const client = supabaseAdmin || supabase!;
      const { data, error } = await client
        .from('products')
        .select('*')
        .eq('id', id)
        .maybeSingle();

      if (!error && data) {
        return mapDbProduct(data);
      }
    } catch {
      // Fallback
    }
  }

  const p = memoryProducts.find((item) => item.id === id);
  return p || null;
}

/**
 * Retrieve categories from Supabase (or defaults)
 */
export async function getCategories(): Promise<Category[]> {
  if (isSupabaseConfigured && (supabaseAdmin || supabase)) {
    try {
      const client = supabaseAdmin || supabase!;
      const { data, error } = await client
        .from('categories')
        .select('*')
        .order('name', { ascending: true });

      if (!error && data && data.length > 0) {
        return data.map((c) => ({
          id: c.id,
          name: c.name,
          slug: c.slug,
          description: c.description,
          imageUrl: c.image_url,
          icon: c.icon,
          parentId: c.parent_id,
          subcategories: [],
        }));
      }
    } catch {
      // Fallback
    }
  }

  return [
    { id: 'office-supplies-stationery', name: 'Office Supplies & Stationery', slug: 'office-supplies-stationery' },
    { id: 'office-technology', name: 'Office Technology & Electronics', slug: 'office-technology' },
    { id: 'cleaning-housekeeping', name: 'Cleaning & Housekeeping', slug: 'cleaning-housekeeping' },
    { id: 'pantry-cafeteria', name: 'Pantry & Cafeteria Supplies', slug: 'pantry-cafeteria' },
    { id: 'safety-security', name: 'Safety, First Aid & Security', slug: 'safety-security' },
    { id: 'ergonomic-furniture', name: 'Ergonomic Office Furniture', slug: 'ergonomic-furniture' },
  ];
}

/**
 * Retrieve brands from Supabase (or defaults)
 */
export async function getBrands(): Promise<Brand[]> {
  if (isSupabaseConfigured && (supabaseAdmin || supabase)) {
    try {
      const client = supabaseAdmin || supabase!;
      const { data, error } = await client
        .from('brands')
        .select('*')
        .order('name', { ascending: true });

      if (!error && data && data.length > 0) {
        return data.map((b) => ({
          id: b.id,
          name: b.name,
          slug: b.slug,
          description: b.description,
          logoUrl: b.logo_url,
        }));
      }
    } catch {
      // Fallback
    }
  }

  return [
    { id: 'officebazzar', name: 'OfficeBazzar', slug: 'officebazzar' },
    { id: 'jk-paper', name: 'JK Paper', slug: 'jk-paper' },
    { id: 'kangaroo', name: 'Kangaro', slug: 'kangaroo' },
    { id: 'camlin', name: 'Camlin Kokuyo', slug: 'camlin' },
    { id: 'dura-clean', name: 'DuraClean Pro', slug: 'dura-clean' },
    { id: 'tata-tea', name: 'Tata Tea & Coffee', slug: 'tata-tea' },
  ];
}

/**
 * Create or update product in Supabase
 */
export async function saveProduct(productData: Partial<Product>): Promise<Product> {
  const generatedSlug =
    productData.slug ||
    (productData.name || 'product')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '') +
      '-' +
      Math.floor(1000 + Math.random() * 9000);

  const generatedSku =
    productData.sku?.trim().toUpperCase() ||
    'OB-' + Math.floor(100000 + Math.random() * 900000);

  if (isSupabaseConfigured && (supabaseAdmin || supabase)) {
    try {
      const client = supabaseAdmin || supabase!;
      const dbPayload = {
        name: productData.name,
        slug: generatedSlug,
        sku: generatedSku,
        category_id: productData.categoryId,
        category_name: productData.categoryName,
        subcategory_id: productData.subcategoryId || null,
        subcategory_name: productData.subcategoryName || null,
        brand_id: productData.brandId,
        brand_name: productData.brandName,
        description: productData.description || '',
        short_description: productData.shortDescription || null,
        specifications: productData.specifications || {},
        price: productData.price !== undefined ? productData.price : null,
        mrp: productData.mrp !== undefined ? productData.mrp : null,
        gst_percent: productData.gstPercent || 18,
        hsn_code: productData.hsnCode || null,
        stock_quantity: productData.stockQuantity || 100,
        min_order_quantity: productData.minOrderQuantity || 1,
        pack_size: productData.packSize || 'Standard Pack',
        images: productData.images || [],
        is_active: productData.isActive !== false,
        is_featured: Boolean(productData.featured),
        is_bestseller: Boolean(productData.bestseller),
        updated_at: new Date().toISOString(),
      };

      if (productData.id) {
        const { data, error } = await client
          .from('products')
          .update(dbPayload)
          .eq('id', productData.id)
          .select()
          .single();

        if (!error && data) {
          const mapped = mapDbProduct(data);
          const idx = memoryProducts.findIndex((p) => p.id === productData.id);
          if (idx !== -1) memoryProducts[idx] = mapped;
          else memoryProducts.unshift(mapped);
          saveDiskCustomProducts(memoryProducts);
          return mapped;
        }
      } else {
        const newId = 'prod-' + Date.now();
        const { data, error } = await client
          .from('products')
          .insert({ id: newId, ...dbPayload })
          .select()
          .single();

        if (!error && data) {
          const mapped = mapDbProduct(data);
          memoryProducts.unshift(mapped);
          saveDiskCustomProducts(memoryProducts);
          return mapped;
        }
      }
    } catch {
      // Fallback
    }
  }

  // In-memory fallback
  if (productData.id) {
    const idx = memoryProducts.findIndex((p) => p.id === productData.id);
    if (idx !== -1) {
      memoryProducts[idx] = {
        ...memoryProducts[idx],
        ...productData,
        slug: generatedSlug,
        sku: generatedSku,
        isActive: productData.isActive !== false,
      } as Product;
      saveDiskCustomProducts(memoryProducts);
      return memoryProducts[idx];
    }
  }

  const newProduct: Product = {
    id: productData.id || 'prod-' + Date.now(),
    name: productData.name || 'New Office Product',
    slug: generatedSlug,
    sku: generatedSku,
    categoryId: productData.categoryId || 'office-supplies-stationery',
    categoryName: productData.categoryName || 'Office Supplies & Stationery',
    subcategoryId: productData.subcategoryId,
    subcategoryName: productData.subcategoryName,
    brandId: productData.brandId || 'officebazzar',
    brandName: productData.brandName || 'OfficeBazzar',
    description: productData.description || 'Enterprise office supplies product.',
    shortDescription: productData.shortDescription || '',
    specifications: productData.specifications || {},
    price: productData.price !== undefined ? productData.price : null,
    mrp: productData.mrp !== undefined ? productData.mrp : null,
    gstPercent: Number(productData.gstPercent) || 18,
    hsnCode: productData.hsnCode,
    stockQuantity: Number(productData.stockQuantity) || 100,
    minOrderQuantity: Number(productData.minOrderQuantity) || 1,
    packSize: productData.packSize || 'Standard Pack',
    images: productData.images && productData.images.length > 0 ? productData.images : ['https://images.unsplash.com/photo-1583485088034-697b5bc54ccd?q=80&w=800&auto=format&fit=crop'],
    rating: null,
    reviewCount: 0,
    isActive: productData.isActive !== false,
    featured: Boolean(productData.featured),
    bestseller: Boolean(productData.bestseller),
    metaTitle: productData.metaTitle,
    metaDescription: productData.metaDescription,
  };

  memoryProducts.unshift(newProduct);
  saveDiskCustomProducts(memoryProducts);
  return newProduct;
}

/**
 * 1-Click publish / unpublish status update
 */
export async function updateProductPublishStatus(id: string, isActive: boolean): Promise<Product | null> {
  if (isSupabaseConfigured && (supabaseAdmin || supabase)) {
    try {
      const client = supabaseAdmin || supabase!;
      const { data, error } = await client
        .from('products')
        .update({ is_active: isActive, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();

      if (!error && data) {
        const mapped = mapDbProduct(data);
        const idx = memoryProducts.findIndex((p) => p.id === id);
        if (idx !== -1) memoryProducts[idx] = mapped;
        saveDiskCustomProducts(memoryProducts);
        return mapped;
      }
    } catch {
      // Fallback
    }
  }

  const idx = memoryProducts.findIndex((p) => p.id === id);
  if (idx !== -1) {
    memoryProducts[idx] = { ...memoryProducts[idx], isActive };
    saveDiskCustomProducts(memoryProducts);
    return memoryProducts[idx];
  }
  return null;
}

/**
 * Delete product from Supabase
 */
export async function deleteProduct(productId: string): Promise<boolean> {
  if (isSupabaseConfigured && (supabaseAdmin || supabase)) {
    try {
      const client = supabaseAdmin || supabase!;
      const { error } = await client.from('products').delete().eq('id', productId);
      if (!error) {
        memoryProducts = memoryProducts.filter((p) => p.id !== productId);
        saveDiskCustomProducts(memoryProducts);
        return true;
      }
    } catch {
      // Fallback
    }
  }

  const initialLen = memoryProducts.length;
  memoryProducts = memoryProducts.filter((p) => p.id !== productId);
  saveDiskCustomProducts(memoryProducts);
  return memoryProducts.length < initialLen;
}

/**
 * Dynamic Category Creation
 */
export async function createCategory(data: {
  name: string;
  slug?: string;
  description?: string;
  parentId?: string | null;
}): Promise<Category> {
  const slug =
    data.slug ||
    data.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
  const id = 'cat-' + slug;

  if (isSupabaseConfigured && (supabaseAdmin || supabase)) {
    try {
      const client = supabaseAdmin || supabase!;
      const { data: dbData, error } = await client
        .from('categories')
        .insert({
          id,
          name: data.name.trim(),
          slug,
          description: data.description || '',
          parent_id: data.parentId || null,
          is_active: true,
        })
        .select()
        .single();

      if (!error && dbData) {
        return {
          id: dbData.id,
          name: dbData.name,
          slug: dbData.slug,
          description: dbData.description,
          subcategories: [],
        };
      }
    } catch {
      // Fallback
    }
  }

  return {
    id,
    name: data.name.trim(),
    slug,
    description: data.description,
    subcategories: [],
  };
}

/**
 * Dynamic Brand Creation
 */
export async function createBrand(data: {
  name: string;
  slug?: string;
  description?: string;
  logoUrl?: string;
}): Promise<Brand> {
  const slug =
    data.slug ||
    data.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
  const id = 'brand-' + slug;

  if (isSupabaseConfigured && (supabaseAdmin || supabase)) {
    try {
      const client = supabaseAdmin || supabase!;
      const { data: dbData, error } = await client
        .from('brands')
        .insert({
          id,
          name: data.name.trim(),
          slug,
          description: data.description || '',
          logo_url: data.logoUrl || null,
        })
        .select()
        .single();

      if (!error && dbData) {
        return {
          id: dbData.id,
          name: dbData.name,
          slug: dbData.slug,
          description: dbData.description,
          logoUrl: dbData.logo_url,
        };
      }
    } catch {
      // Fallback
    }
  }

  return {
    id,
    name: data.name.trim(),
    slug,
    description: data.description,
    logoUrl: data.logoUrl,
  };
}
