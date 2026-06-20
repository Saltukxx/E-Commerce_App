import type { Product } from '@/lib/types';
import { parseApiList } from '@/lib/utils';



export function dedupeSections(sections: Product[][], limit = 8): Product[][] {

  const used = new Set<number>();

  return sections.map((section) => {

    const result: Product[] = [];

    for (const product of section) {

      if (used.has(product.id)) continue;

      result.push(product);

      used.add(product.id);

      if (result.length >= limit) break;

    }

    return result;

  });

}



export async function fetchHomeProducts(api: string): Promise<{

  newest: Product[];

  bestselling: Product[];

  recommended: Product[];

}> {

  const fetchList = async (sort: string) => {

    try {

      const res = await fetch(`${api}/products?limit=12&sort=${sort}`, {

        next: { revalidate: 60 },

      });

      if (!res.ok) return [] as Product[];
      return parseApiList<Product>(await res.json());

    } catch {

      return [] as Product[];

    }

  };



  const [newestRaw, bestsellingRaw, recommendedRaw] = await Promise.all([

    fetchList('newest'),

    fetchList('bestselling'),

    fetchList('default'),

  ]);



  const [newest, bestselling, recommended] = dedupeSections(

    [newestRaw, bestsellingRaw, recommendedRaw],

    8,

  );



  return { newest, bestselling, recommended };

}

