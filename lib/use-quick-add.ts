'use client'

import { useCallback } from 'react'
import { useCart } from '@/lib/cart-context'
import { type Product, DEFAULT_SIZE } from '@/lib/products'
import { productToItem, trackAddToCart } from '@/lib/tracking'

type QuickAddProduct = Pick<Product, 'slug' | 'name' | 'image' | 'price' | 'whiteSku' | 'blackSku' | 'brand'>

// Single entry point for every off-PDP "Add to Cart" (home, collection, search
// cards) so each one pushes the same GA4 add_to_cart payload as the product page.
export function useQuickAdd() {
  const { addItem } = useCart()

  return useCallback(
    (product: QuickAddProduct, quantity = 1) => {
      addItem(
        {
          id: `${product.slug}-${DEFAULT_SIZE}`,
          slug: product.slug,
          name: product.name,
          image: product.image,
          size: DEFAULT_SIZE,
          price: product.price,
          whiteSku: product.whiteSku,
          blackSku: product.blackSku,
        },
        quantity,
      )
      trackAddToCart(productToItem(product, { variant: DEFAULT_SIZE, price: product.price, quantity }))
    },
    [addItem],
  )
}
