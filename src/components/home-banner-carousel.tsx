import { useCallback, useEffect, useRef, useState } from 'react';
import {
  Image,
  Linking,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';

import { JC } from '@/constants/jc-theme';

export type HomeBanner = {
  _id: string;
  title?: string;
  subtitle?: string;
  image?: string;
  link?: string;
  bgColor?: string;
};

type Props = {
  banners: HomeBanner[];
  loading?: boolean;
  fallbackTitle?: string;
  fallbackSubtitle?: string;
};

const SLIDE_INTERVAL_MS = 4500;
const SLIDE_HEIGHT = 168;

export function HomeBannerCarousel({ banners, loading, fallbackTitle, fallbackSubtitle }: Props) {
  const scrollRef = useRef<ScrollView>(null);
  const [index, setIndex] = useState(0);
  const { width: windowWidth } = useWindowDimensions();
  const slideWidth = Math.min(windowWidth, JC.maxWidth) - 32;

  const slides =
    banners.length > 0
      ? banners
      : [
          {
            _id: 'default',
            title: fallbackTitle || 'We have some gift for you!',
            subtitle: fallbackSubtitle || '',
            bgColor: '#FF6B35',
            image: '',
          },
        ];

  const onScroll = useCallback(
    (e: NativeSyntheticEvent<NativeScrollEvent>) => {
      const x = e.nativeEvent.contentOffset.x;
      const i = Math.round(x / slideWidth);
      if (i >= 0 && i < slides.length) setIndex(i);
    },
    [slideWidth, slides.length]
  );

  useEffect(() => {
    setIndex(0);
    scrollRef.current?.scrollTo({ x: 0, animated: false });
  }, [slides.length, slideWidth]);

  useEffect(() => {
    if (slides.length <= 1) return;
    const timer = setInterval(() => {
      setIndex((prev) => {
        const next = (prev + 1) % slides.length;
        scrollRef.current?.scrollTo({ x: next * slideWidth, animated: true });
        return next;
      });
    }, SLIDE_INTERVAL_MS);
    return () => clearInterval(timer);
  }, [slides.length, slideWidth]);

  function openLink(link?: string) {
    if (!link?.trim()) return;
    Linking.openURL(link.trim()).catch(() => {});
  }

  if (loading) {
    return (
      <View style={[styles.wrap, styles.loadingBox, { width: slideWidth, height: SLIDE_HEIGHT }]}>
        <Text style={styles.loadingText}>Loading banners...</Text>
      </View>
    );
  }

  return (
    <View style={styles.wrap}>
      <ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={onScroll}
        decelerationRate="fast"
        snapToInterval={slideWidth}
        snapToAlignment="start"
        contentContainerStyle={{ width: slideWidth * slides.length }}>
        {slides.map((b) => {
          const hasImage = Boolean(b.image && b.image.length > 30);
          const hasText = Boolean(b.title?.trim() || b.subtitle?.trim());
          return (
            <Pressable
              key={b._id}
              style={[styles.slide, { width: slideWidth, backgroundColor: b.bgColor || '#FF6B35' }]}
              onPress={() => openLink(b.link)}>
              {hasImage ? (
                <Image source={{ uri: b.image! }} style={styles.slideImage} resizeMode="cover" />
              ) : null}
              {hasText ? (
                <View style={[styles.slideText, hasImage ? styles.slideTextOverlay : null]}>
                  {b.title ? <Text style={styles.title}>{b.title}</Text> : null}
                  {b.subtitle ? <Text style={styles.subtitle}>{b.subtitle}</Text> : null}
                </View>
              ) : null}
            </Pressable>
          );
        })}
      </ScrollView>
      {slides.length > 1 ? (
        <View style={styles.dots}>
          {slides.map((b, i) => (
            <Pressable key={b._id} onPress={() => scrollRef.current?.scrollTo({ x: i * slideWidth, animated: true })}>
              <View style={[styles.dot, i === index && styles.dotActive]} />
            </Pressable>
          ))}
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { marginBottom: 16, alignSelf: 'center' },
  loadingBox: {
    borderRadius: 16,
    backgroundColor: JC.grayLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: { color: JC.gray, fontSize: 14 },
  slide: {
    height: SLIDE_HEIGHT,
    borderRadius: 16,
    overflow: 'hidden',
    justifyContent: 'flex-end',
  },
  slideImage: {
    ...StyleSheet.absoluteFillObject,
    width: '100%',
    height: '100%',
  },
  slideText: {
    padding: 16,
  },
  slideTextOverlay: {
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  title: { color: JC.white, fontSize: 18, fontWeight: '800' },
  subtitle: { color: JC.white, fontSize: 13, marginTop: 4, opacity: 0.95 },
  dots: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
    marginTop: 10,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: JC.grayBorder,
  },
  dotActive: {
    backgroundColor: JC.green,
    width: 22,
  },
});
