import { Category, Product } from '@prisma/client';

type ProductWithCategory = Product & { category: Category };

export function mapCategory(c: Category) {
  return {
    creationAt: c.createdAt.toISOString(),
    id: c.id,
    image: c.image,
    name: c.name,
    slug: c.slug,
    updatedAt: c.updatedAt.toISOString(),
  };
}

export function mapProduct(p: ProductWithCategory) {
  return {
    category: mapCategory(p.category),
    creationAt: p.createdAt.toISOString(),
    description: p.description,
    id: p.id,
    images: p.images,
    price: p.price,
    slug: p.slug,
    title: p.title,
    updatedAt: p.updatedAt.toISOString(),
  };
}

export function mapCartItem(line: {
  id: number;
  userId: number;
  productId: number;
  quantity: number;
  productName: string;
  price: number;
  imageUrl: string | null;
  name: string;
}) {
  return {
    id: line.id,
    productId: line.productId,
    userId: line.userId,
    name: line.name,
    price: line.price,
    imageUrl: line.imageUrl,
    quantity: line.quantity,
    productName: line.productName,
  };
}
