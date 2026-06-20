'use client';



import Image from 'next/image';

import Link from 'next/link';

import { useCallback, useEffect, useState } from 'react';

import { MOBILE_ASSETS } from '@/lib/mobile-assets';

import { cn } from '@/lib/utils';

import { RevealOnScroll } from '@/components/storefront/reveal-on-scroll';

import { SectionHeader } from '@/components/storefront/home/section-header';



const INTERVAL_MS = 4500;



export function BannerCarousel({ className }: { className?: string }) {

  const banners = MOBILE_ASSETS.banners;

  const [active, setActive] = useState(0);

  const [paused, setPaused] = useState(false);



  const advance = useCallback(() => {

    setActive((prev) => (prev + 1) % banners.length);

  }, [banners.length]);



  useEffect(() => {

    if (paused || banners.length <= 1) return;

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (reducedMotion) return;



    const timer = window.setInterval(advance, INTERVAL_MS);

    return () => window.clearInterval(timer);

  }, [advance, paused, banners.length]);



  return (

    <RevealOnScroll as="section" className={className}>

      <SectionHeader eyebrow="Aktionen" title="Aktuelle Highlights" />

      <div

        className="relative overflow-hidden rounded-2xl border border-[var(--db-border)] bg-white"

        onMouseEnter={() => setPaused(true)}

        onMouseLeave={() => setPaused(false)}

        onFocus={() => setPaused(true)}

        onBlur={() => setPaused(false)}

      >

        <div className="relative aspect-[16/9] md:aspect-[21/9] lg:aspect-[2.4/1]">

          {banners.map((banner, index) => (

            <Link

              key={banner.id}

              href={banner.href}

              className={cn(

                'absolute inset-0 transition-opacity duration-700 ease-[var(--ease-out-expo)]',

                index === active ? 'opacity-100' : 'pointer-events-none opacity-0',

              )}

              aria-hidden={index !== active}

              tabIndex={index === active ? 0 : -1}

            >

              <Image

                src={banner.image}

                alt={`DurmusBaba Highlight ${banner.id === 'drc' ? 'DRC-Kältetechnik' : index + 1}`}

                fill

                className="object-contain object-center md:object-cover"

                sizes="(max-width:768px) 100vw, 1200px"

                priority={index === 0}

              />

            </Link>

          ))}

        </div>

        {banners.length > 1 ? (

          <div className="absolute bottom-0 left-0 right-0 h-1 bg-black/10">

            <div

              className="h-full bg-[var(--db-primary)] transition-all duration-300"

              style={{ width: `${((active + 1) / banners.length) * 100}%` }}

              role="progressbar"

              aria-valuenow={active + 1}

              aria-valuemin={1}

              aria-valuemax={banners.length}

            />

          </div>

        ) : null}

      </div>

      {banners.length > 1 ? (

        <div className="mt-3 flex justify-center gap-2">

          {banners.map((banner, index) => (

            <button

              key={banner.id}

              type="button"

              aria-label={`Slide ${index + 1}`}

              aria-current={index === active ? 'true' : undefined}

              onClick={() => setActive(index)}

              className={cn(

                'h-1.5 rounded-full transition-all duration-300',

                index === active

                  ? 'w-8 bg-[var(--db-primary)]'

                  : 'w-1.5 bg-[var(--db-border)] hover:bg-[var(--db-muted)]',

              )}

            />

          ))}

        </div>

      ) : null}

    </RevealOnScroll>

  );

}

