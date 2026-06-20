'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui';
import { apiFetch } from '@/lib/api-client';
import { useAuthStore } from '@/lib/auth-store';
import type { Product } from '@/lib/types';

export function ProductDetailActions({ product }: { product: Product }) {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  async function addToCart() {
    if (!user) {
      router.push('/anmelden');
      return;
    }
    setLoading(true);
    setMessage('');
    try {
      await apiFetch(`/cart/${user.id}`, {
        method: 'POST',
        body: JSON.stringify({
          productId: product.id,
          productName: product.title,
          price: product.price,
          quantity: 1,
          userId: user.id,
        }),
      });
      setMessage('Zum Warenkorb hinzugefügt.');
    } catch (e) {
      setMessage(e instanceof Error ? e.message : 'Fehler');
    } finally {
      setLoading(false);
    }
  }

  async function addToWishlist() {
    if (!user) {
      router.push('/anmelden');
      return;
    }
    setLoading(true);
    try {
      await apiFetch(`/wishlist/${user.id}`, {
        method: 'POST',
        body: JSON.stringify({ productId: product.id }),
      });
      setMessage('Zur Wunschliste hinzugefügt.');
    } catch (e) {
      setMessage(e instanceof Error ? e.message : 'Fehler');
    } finally {
      setLoading(false);
    }
  }

  async function requestQuote() {
    if (!user) {
      router.push('/anmelden');
      return;
    }
    setLoading(true);
    try {
      await apiFetch('/price-inquiries', {
        method: 'POST',
        body: JSON.stringify({ productId: product.id }),
      });
      setMessage('Preisanfrage gesendet.');
    } catch (e) {
      setMessage(e instanceof Error ? e.message : 'Fehler');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mt-8 flex flex-wrap gap-3">
      {product.price > 0 ? (
        <Button onClick={addToCart} disabled={loading}>In den Warenkorb</Button>
      ) : (
        <Button onClick={requestQuote} disabled={loading}>Preis anfragen</Button>
      )}
      <Button variant="secondary" onClick={addToWishlist} disabled={loading}>Merken</Button>
      {message ? <p className="w-full text-sm text-gray-600">{message}</p> : null}
    </div>
  );
}
