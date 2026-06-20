import { revalidatePath } from 'next/cache';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const secret = process.env.REVALIDATE_SECRET;
  if (!secret || request.headers.get('x-revalidate-secret') !== secret) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let paths: string[] = ['/', '/katalog', '/haendler'];
  try {
    const body = (await request.json()) as { paths?: string[] };
    if (body.paths?.length) paths = body.paths;
  } catch {
    /* default paths */
  }

  for (const path of paths) {
    revalidatePath(path);
  }

  return NextResponse.json({ revalidated: true, paths });
}
