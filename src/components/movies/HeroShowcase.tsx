import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';
import { MediaImage } from '../common/MediaImage';
import type { Banner } from '../../types/catalogue';

interface HeroShowcaseProps {
  banners: Banner[];
  cityName: string;
}

export function HeroShowcase({ banners, cityName }: HeroShowcaseProps) {
  const [activeIndex, setActiveIndex] = useState(0);

  if (banners.length === 0) return null;

  const current = banners[activeIndex % banners.length];

  const handlePrev = () => {
    setActiveIndex((prev) => (prev - 1 + banners.length) % banners.length);
  };

  const handleNext = () => {
    setActiveIndex((prev) => (prev + 1) % banners.length);
  };

  return (
    <section
      aria-label="Featured theatrical presentation"
      className="relative overflow-hidden pt-8 pb-6 sm:pt-12 sm:pb-10"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative neu-card rounded-[34px] p-6 sm:p-10 lg:p-12 overflow-hidden">
          {/* Subtle Organic Sculpted Pastel Shapes */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -top-16 -right-14 w-56 h-56 rounded-[46%_54%_60%_40%/48%_44%_56%_52%] neu-shape-mint opacity-65"
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -bottom-20 left-1/3 w-48 h-48 rounded-[58%_42%_44%_56%/50%_58%_42%_50%] neu-shape-peach opacity-60"
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute top-12 -left-16 w-36 h-36 rounded-full neu-shape-sage opacity-45"
          />

          <div className="relative grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-stretch">
            {/* Editorial Copy & Raised Controls */}
            <div className="lg:col-span-6 flex flex-col justify-between py-1">
              <div>
                <p className="text-xs sm:text-sm font-semibold text-[#567360] tracking-wide">
                  {current.eyebrow} <span aria-hidden="true">·</span> {cityName}
                </p>
                <h1 className="font-display text-3xl sm:text-5xl font-extrabold tracking-tight text-[#394A43] leading-[1.08] mt-3 mb-4">
                  {current.headline}
                </h1>
                <p className="text-sm sm:text-base text-[#5A6D65] leading-relaxed max-w-xl">
                  {current.subheadline}
                </p>
              </div>

              <div className="mt-8 space-y-6">
                <div className="flex flex-wrap items-center gap-4">
                  <Link
                    to={`/movies/${current.movieId}/shows`}
                    className="inline-flex items-center gap-2 px-7 py-3.5 text-sm font-semibold rounded-full neu-btn-primary whitespace-nowrap shrink-0"
                  >
                    <span>{current.ctaLabel}</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                  <Link
                    to={`/movies/${current.movieId}`}
                    className="inline-flex items-center px-6 py-3.5 text-sm font-semibold rounded-full neu-btn whitespace-nowrap shrink-0"
                  >
                    Film Details
                  </Link>
                </div>

                {banners.length > 1 && (
                  <div className="flex items-center gap-3 pt-1">
                    <button
                      type="button"
                      onClick={handlePrev}
                      className="w-10 h-10 inline-flex items-center justify-center rounded-full neu-btn text-[#394A43] cursor-pointer"
                      aria-label="Previous featured film"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={handleNext}
                      className="w-10 h-10 inline-flex items-center justify-center rounded-full neu-btn text-[#394A43] cursor-pointer"
                      aria-label="Next featured film"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                    <span className="font-mono text-xs font-medium text-[#5A6D65] tabular-nums pl-1">
                      {String(activeIndex + 1).padStart(2, '0')} /{' '}
                      {String(banners.length).padStart(2, '0')}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Real Widescreen Cinema Still in Tactile Raised Warm-White Frame */}
            <div className="lg:col-span-6 flex items-stretch">
              <div className="w-full rounded-[28px] p-3 neu-floating flex">
                <div className="relative w-full aspect-[16/10] lg:aspect-auto lg:min-h-[340px] rounded-[20px] overflow-hidden bg-[#ECE0CE]">
                  <MediaImage
                    src={current.imageUrl}
                    alt={current.headline}
                    title={current.headline}
                    loading="eager"
                    className="w-full h-full object-cover object-center transition-opacity duration-300"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
