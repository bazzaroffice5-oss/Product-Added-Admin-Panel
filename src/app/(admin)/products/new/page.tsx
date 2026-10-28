import React from 'react';
import { getCategories, getBrands } from '@/lib/db/adminStore';
import ProductFormClient from '@/components/admin/ProductFormClient';

export const dynamic = 'force-dynamic';

export default async function NewProductPage() {
  const [categories, brands] = await Promise.all([
    getCategories(),
    getBrands(),
  ]);

  return (
    <ProductFormClient
      mode="create"
      categories={categories}
      brands={brands}
    />
  );
}
