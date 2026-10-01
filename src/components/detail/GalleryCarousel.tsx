import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  useWindowDimensions,
  TouchableOpacity,
  Linking,
  Modal,
  SafeAreaView,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from 'react-native';
import { DogApiImage } from '../../types';
import { useAppTheme } from '../../hooks/useAppTheme';

interface GalleryCarouselProps {
  images: DogApiImage[];
  breedName: string;
}

export const GalleryCarousel: React.FC<GalleryCarouselProps> = ({ images, breedName }) => {
  const { colors, isDark } = useAppTheme();
  const { width: screenWidth } = useWindowDimensions();
  const [activeIndex, setActiveIndex] = useState(0);
  const [lightboxImage, setLightboxImage] = useState<DogApiImage | null>(null);
  const flatListRef = useRef<FlatList<DogApiImage>>(null);

  const glassBg = isDark ? 'rgba(15, 23, 42, 0.48)' : 'rgba(255, 255, 255, 0.35)';
  const glassBorder = isDark ? 'rgba(255, 255, 255, 0.24)' : 'rgba(255, 255, 255, 0.72)';
  const arrowColor = isDark ? '#FFFFFF' : '#0F172A';

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const contentOffsetX = event.nativeEvent.contentOffset.x;
    if (screenWidth > 0) {
      const index = Math.round(contentOffsetX / screenWidth);
      if (index >= 0 && index < images.length && index !== activeIndex) {
        setActiveIndex(index);
      }
    }
  };

  const scrollToIndex = (index: number) => {
    if (index >= 0 && index < images.length) {
      flatListRef.current?.scrollToIndex({ index, animated: true });
      setActiveIndex(index);
    }
  };

  const openLink = async (url?: string) => {
    if (url && (await Linking.canOpenURL(url))) {
      await Linking.openURL(url);
    }
  };

  if (!images || images.length === 0) {
    return (
      <View style={[styles.emptyContainer, { backgroundColor: colors.surfaceSubtle }]}>
        <Text style={styles.emptyIcon}>📷</Text>
        <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
          No high-resolution photos available for {breedName}.
        </Text>
      </View>
    );
  }

  const currentImage = images[activeIndex] || images[0];
  const attribution = currentImage.attribution;

  return (
    <View style={styles.container}>
      <View style={styles.trackerRow}>
        <Text style={[styles.galleryTitle, { color: colors.textPrimary }]}>
          Photo Gallery
        </Text>
        <View style={[styles.counterBadge, { backgroundColor: colors.surfaceSubtle }]}>
          <Text style={[styles.counterText, { color: colors.textSecondary }]}>
            {activeIndex + 1} of {images.length}
          </Text>
        </View>
      </View>

      <View style={styles.carouselWrapper}>
        <FlatList
          ref={flatListRef}
          data={images}
          keyExtractor={(item) => item.id}
          horizontal
          pagingEnabled={true}
          showsHorizontalScrollIndicator={false}
          onMomentumScrollEnd={handleScroll}
          decelerationRate="fast"
          contentContainerStyle={styles.listContent}
          getItemLayout={(_, index) => ({
            length: screenWidth,
            offset: screenWidth * index,
            index,
          })}
          renderItem={({ item, index }) => (
            <View
              style={[
                styles.slideContainer,
                { width: screenWidth, paddingHorizontal: 16 },
              ]}
            >
              <TouchableOpacity
                activeOpacity={0.92}
                onPress={() => setLightboxImage(item)}
                style={styles.slideTouchable}
                accessibilityRole="imagebutton"
                accessibilityLabel={`Photo ${index + 1} of ${images.length} of ${breedName}. Tap to view fullscreen.`}
              >
                <View
                  style={[
                    styles.imageWrapper,
                    { backgroundColor: colors.surfaceSubtle, borderColor: colors.borderSubtle },
                  ]}
                >
                  <Image
                    source={{ uri: item.medium || item.large || item.url }}
                    style={styles.image}
                    resizeMode="cover"
                  />
                </View>
              </TouchableOpacity>
            </View>
          )}
        />

        {images.length > 1 && (
          <>
            {activeIndex > 0 && (
              <TouchableOpacity
                style={[
                  styles.arrowButton,
                  styles.arrowLeft,
                  { backgroundColor: glassBg, borderColor: glassBorder },
                ]}
                onPress={() => scrollToIndex(activeIndex - 1)}
                activeOpacity={0.72}
                accessibilityRole="button"
                accessibilityLabel="Previous image"
              >
                <Text style={[styles.arrowText, { color: arrowColor }]}>‹</Text>
              </TouchableOpacity>
            )}

            {activeIndex < images.length - 1 && (
              <TouchableOpacity
                style={[
                  styles.arrowButton,
                  styles.arrowRight,
                  { backgroundColor: glassBg, borderColor: glassBorder },
                ]}
                onPress={() => scrollToIndex(activeIndex + 1)}
                activeOpacity={0.72}
                accessibilityRole="button"
                accessibilityLabel="Next image"
              >
                <Text style={[styles.arrowText, { color: arrowColor }]}>›</Text>
              </TouchableOpacity>
            )}
          </>
        )}
      </View>

      {images.length > 1 && (
        <View style={styles.dotsRow}>
          {images.map((_, idx) => (
            <TouchableOpacity
              key={idx}
              onPress={() => scrollToIndex(idx)}
              hitSlop={{ top: 8, bottom: 8, left: 4, right: 4 }}
              accessibilityRole="button"
              accessibilityLabel={`Go to photo ${idx + 1}`}
            >
              <View
                style={[
                  styles.dot,
                  {
                    backgroundColor:
                      idx === activeIndex ? colors.accent : colors.borderSubtle,
                    width: idx === activeIndex ? 18 : 6,
                  },
                ]}
              />
            </TouchableOpacity>
          ))}
        </View>
      )}

      {attribution && (
        <View
          style={[
            styles.attributionCard,
            { backgroundColor: colors.surface, borderColor: colors.borderSubtle },
          ]}
        >
          <View style={styles.attributionHeader}>
            <Text style={styles.attrIcon}>ℹ️</Text>
            <Text style={[styles.attrTitle, { color: colors.textPrimary }]}>
              Image License & Attribution
            </Text>
          </View>

          {attribution.author && (
            <View style={styles.attrRow}>
              <Text style={[styles.attrLabel, { color: colors.textMuted }]}>Author:</Text>
              <Text style={[styles.attrVal, { color: colors.textSecondary }]}>
                {attribution.author}
              </Text>
            </View>
          )}

          {attribution.license && (
            <View style={styles.attrRow}>
              <Text style={[styles.attrLabel, { color: colors.textMuted }]}>License:</Text>
              {attribution.license_url ? (
                <TouchableOpacity
                  onPress={() => openLink(attribution.license_url)}
                  accessibilityRole="link"
                  accessibilityLabel={`License: ${attribution.license}. Opens external license page.`}
                >
                  <Text style={[styles.attrLink, { color: colors.accent }]}>
                    {attribution.license} ↗
                  </Text>
                </TouchableOpacity>
              ) : (
                <Text style={[styles.attrVal, { color: colors.textSecondary }]}>
                  {attribution.license}
                </Text>
              )}
            </View>
          )}

          {attribution.source && (
            <View style={styles.attrRow}>
              <Text style={[styles.attrLabel, { color: colors.textMuted }]}>Source:</Text>
              {attribution.source_url ? (
                <TouchableOpacity
                  onPress={() => openLink(attribution.source_url)}
                  accessibilityRole="link"
                  accessibilityLabel={`Source: ${attribution.source}. Opens external source repository.`}
                >
                  <Text style={[styles.attrLink, { color: colors.accentSecondary }]}>
                    {attribution.source} ↗
                  </Text>
                </TouchableOpacity>
              ) : (
                <Text style={[styles.attrVal, { color: colors.textSecondary }]}>
                  {attribution.source}
                </Text>
              )}
            </View>
          )}
        </View>
      )}

      <Modal
        visible={lightboxImage !== null}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setLightboxImage(null)}
      >
        <SafeAreaView style={styles.lightboxContainer}>
          <TouchableOpacity
            style={styles.closeBtn}
            onPress={() => setLightboxImage(null)}
            accessibilityRole="button"
            accessibilityLabel="Close fullscreen image viewer"
          >
            <Text style={styles.closeBtnText}>✕ Close</Text>
          </TouchableOpacity>

          {lightboxImage && (
            <View style={styles.lightboxImageWrapper}>
              <Image
                source={{
                  uri:
                    lightboxImage.large ||
                    lightboxImage.medium ||
                    lightboxImage.url,
                }}
                style={styles.lightboxImage}
                resizeMode="contain"
              />
            </View>
          )}
        </SafeAreaView>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 16,
  },
  trackerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  galleryTitle: {
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  counterBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  counterText: {
    fontSize: 12,
    fontWeight: '700',
  },
  carouselWrapper: {
    position: 'relative',
    justifyContent: 'center',
  },
  listContent: {
    paddingHorizontal: 0,
  },
  slideContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  slideTouchable: {
    width: '100%',
  },
  imageWrapper: {
    width: '100%',
    height: 270,
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  arrowButton: {
    position: 'absolute',
    top: '50%',
    marginTop: -21,
    width: 42,
    height: 42,
    borderRadius: 21,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    zIndex: 10,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.22,
    shadowRadius: 10,
    elevation: 4,
  },
  arrowLeft: {
    left: 24,
  },
  arrowRight: {
    right: 24,
  },
  arrowText: {
    fontSize: 26,
    fontWeight: '700',
    lineHeight: 28,
    marginTop: -2,
    textAlign: 'center',
  },
  dotsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
    marginTop: 14,
  },
  dot: {
    height: 6,
    borderRadius: 3,
  },
  attributionCard: {
    marginHorizontal: 16,
    marginTop: 16,
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
  },
  attributionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  attrIcon: {
    fontSize: 14,
    marginRight: 6,
  },
  attrTitle: {
    fontSize: 13,
    fontWeight: '700',
  },
  attrRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  attrLabel: {
    fontSize: 12,
    width: 60,
    fontWeight: '500',
  },
  attrVal: {
    fontSize: 12,
    fontWeight: '500',
    flex: 1,
  },
  attrLink: {
    fontSize: 12,
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
  emptyContainer: {
    margin: 16,
    padding: 32,
    borderRadius: 16,
    alignItems: 'center',
  },
  emptyIcon: {
    fontSize: 36,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    textAlign: 'center',
  },
  lightboxContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.95)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeBtn: {
    position: 'absolute',
    top: 50,
    right: 20,
    zIndex: 10,
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 20,
  },
  closeBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  lightboxImageWrapper: {
    width: '100%',
    height: '80%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  lightboxImage: {
    width: '100%',
    height: '100%',
  },
});
