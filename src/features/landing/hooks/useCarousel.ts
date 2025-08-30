// src/hooks/useCarousel.ts
import { useState, useEffect, useCallback } from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import type { EmblaOptionsType, EmblaCarouselType } from 'embla-carousel';
import Autoplay, { type AutoplayOptionsType } from 'embla-carousel-autoplay';

// تعريف نوع الخيارات ليكون واضحًا
type UseCarouselOptions = {
  emblaOptions?: EmblaOptionsType;
  autoplayOptions?: AutoplayOptionsType;
};

export const useCarousel = (options: UseCarouselOptions = {}) => {
  const { emblaOptions, autoplayOptions } = options;

  // إعداد الإضافات، فقط نضيف Autoplay إذا تم تمرير خياراته
  const plugins = autoplayOptions ? [Autoplay(autoplayOptions)] : [];

  const [emblaRef, emblaApi] = useEmblaCarousel(emblaOptions, plugins);

  const [selectedIndex, setSelectedIndex] = useState(0);
  const [scrollSnaps, setScrollSnaps] = useState<number[]>([]);
  const [scrollProgress, setScrollProgress] = useState(0);
  const onScroll = useCallback((emblaApi: EmblaCarouselType) => {
    setScrollProgress(emblaApi.scrollProgress());
  }, []);
  const scrollTo = useCallback((index: number) => emblaApi?.scrollTo(index), [emblaApi]);
  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi]);

  const onSelect = useCallback((emblaApi: EmblaCarouselType) => {
    setSelectedIndex(emblaApi.selectedScrollSnap());
  }, []);

  useEffect(() => {
    if (!emblaApi) return;
    setScrollSnaps(emblaApi.scrollSnapList());
    emblaApi.on('select', onSelect);
    emblaApi.on('reInit', onSelect);
    emblaApi.on('scroll', onScroll); // إضافة حدث التمرير
    // تأكد من تحديث الحالة عند التحميل الأول
    onSelect(emblaApi);
  }, [emblaApi, onSelect]);

  return {
    emblaRef,
    emblaApi,
    scrollSnaps,
    selectedIndex,
    scrollProgress,
    scrollTo,
    scrollPrev,
    scrollNext,
  };
};