import { getThumb } from "@/plugins/utils";
import { useAppTheme, AppTheme } from "@/providers/style_provider";
import { act } from "@react-three/fiber";
import _ from "lodash";
import { createRef, useEffect, useLayoutEffect, useState } from "react";
import { FlatList, Image, ImageStyle, StyleSheet, View, ViewStyle, useWindowDimensions } from "react-native";

export interface Props {
  images: string[];
  hideIndicators?: boolean;
  imageRatio?: number;
  animating?: boolean;
  duration?: number;
  imageStyle?: ViewStyle & ImageStyle;
}

export default function Carousel({ images, hideIndicators, imageStyle, ...props }: Props) {
  const imageRatio = props.imageRatio ?? 16 / 9;
  const animating = props.animating ?? true;
  const canAnimate = images.length > 1;
  const duration = props.duration ?? 10000;

  const { width: screenWidth } = useWindowDimensions();
  const horizontalSpacing = imageStyle?.paddingHorizontal ?? imageStyle?.marginHorizontal ?? 0;
  const width = screenWidth - (typeof horizontalSpacing === "number" ? horizontalSpacing * 2 : 0);
  const height = width * (1 / imageRatio);
  const { theme } = useAppTheme();
  const style = useStyle({ theme });

  const ref = createRef<FlatList>();
  const [activeIndex, setActiveIndex] = useState(0);

  useLayoutEffect(() => {
    if (animating && canAnimate) {
      setInterval(() => {
        setActiveIndex((index) => (index + 1) % images.length);
      }, duration);
    }
  }, []);

  useEffect(() => {
    if (ref.current && canAnimate) {
      ref.current?.scrollToIndex({ animated: true, index: activeIndex });
    }
  }, [activeIndex]);

  function onMomentumScrollEnd({ nativeEvent }) {
    const index = Math.round(nativeEvent.contentOffset.x / width);
    setActiveIndex(index);
  }

  return (
    <View style={{ flexDirection: "column" }}>
      <FlatList
        ref={ref}
        horizontal
        snapToInterval={width}
        pagingEnabled={true}
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={onMomentumScrollEnd}
        onScrollToIndexFailed={(info) => {
          const wait = new Promise((resolve) => setTimeout(resolve, 500));
          wait.then(() => {
            ref.current?.scrollToIndex({ index: info.index, animated: true });
          });
        }}
        data={images}
        renderItem={({ item }) => (
          <View style={[imageStyle, { width, height, overflow: "hidden", position: "relative" }]}>
            <Image source={{ uri: getThumb(item) }} style={{ width: "100%", height: "100%" }} />
          </View>
        )}
      />
      {!!!hideIndicators && images.length > 1 && (
        <View
          style={{
            flexDirection: "row",
            justifyContent: "center",
            alignContent: "center",
            columnGap: theme.spacing.xxs,
            marginVertical: theme.spacing.xxs,
          }}
        >
          {images.map((it, index) => (
            <View key={it} style={[style.indicator, { backgroundColor: index === activeIndex ? theme.colors.primary : theme.colors.grey3 }]} />
          ))}
        </View>
      )}
    </View>
  );
}

const useStyle = ({ theme }: { theme: AppTheme }) =>
  StyleSheet.create({
    indicator: {
      width: 8,
      height: 8,
      borderRadius: 999,
      overflow: "hidden",
    },
  });
