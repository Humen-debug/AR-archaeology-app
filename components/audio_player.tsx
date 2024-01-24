import { useEffect, useMemo, useRef, useState } from "react";
import { TouchableOpacity, PanResponder, View, LayoutRectangle, StyleSheet, ImageBackground } from "react-native";
import { Audio } from "expo-av";
import { useAppTheme } from "@styles";
import { LinearGradient } from "expo-linear-gradient";
import PlayIcon from "@assets/icons/play-dark.svg";
import PauseIcon from "@assets/icons/pause-dark.svg";
import ForwardIcon from "@assets/icons/forward.svg";
import ReplayIcon from "@assets/icons/replay.svg";
import { Text } from "react-native-paper";
import Animated, {
  useSharedValue,
  withTiming,
  useAnimatedStyle,
  Easing,
  useAnimatedReaction,
  runOnJS,
  interpolate,
  Extrapolation,
} from "react-native-reanimated";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import moment from "moment";

interface AudioPlayerProps {
  soundUri: PossibleAsset;
}

export default function AudioPlayer(props: AudioPlayerProps) {
  const theme = useAppTheme();
  const [sound, setSound] = useState<Audio.Sound | null>(null);

  const [playing, setPlaying] = useState(false);

  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const dotOffsetX = useSharedValue(0);
  const layoutWidth = useSharedValue(0);
  const dotStartX = useSharedValue(0);

  const convertValue = (inputX: number | undefined, outputX: number, x: number): number => {
    return (outputX / (inputX ?? 1)) * x;
  };
  const mapOffsetToTime = async (offset: number) => {
    if (!sound) return;
    const measuredTime = Math.floor(interpolate(offset, [0, layoutWidth.value], [0, duration], Extrapolation.CLAMP));
    await sound?.setPositionAsync(measuredTime);
  };

  const formatMsToS = (milliSec: number): string => {
    const duration = moment.duration(milliSec, "milliseconds");

    return duration ? `${duration.minutes()}:${duration.seconds()}` : "00:00";
  };

  const panGesture = Gesture.Pan()
    .onBegin((e) => {
      dotStartX.value = dotOffsetX.value;
    })
    .onUpdate((e) => {
      const currentOffsetX = dotStartX.value + e.translationX;

      if (currentOffsetX > layoutWidth.value) {
        dotOffsetX.value = layoutWidth.value;
      } else if (currentOffsetX < 0) {
        dotOffsetX.value = 0;
      } else {
        dotOffsetX.value = currentOffsetX;
      }
    })
    .onEnd((e) => {
      const currentOffsetX = dotStartX.value + e.translationX;
      if (currentOffsetX < 0) {
        runOnJS(mapOffsetToTime)(0);
      } else if (currentOffsetX > layoutWidth.value) {
        runOnJS(mapOffsetToTime)(layoutWidth.value);
      } else {
        runOnJS(mapOffsetToTime)(currentOffsetX);
      }
    });

  useAnimatedReaction(
    () => Math.round(dotOffsetX.value),
    (current, prev) => {
      if (prev && current.toFixed(2) !== prev.toFixed(2)) {
        const measuredTime = Math.floor(interpolate(current, [0, layoutWidth.value], [0, duration]));
        runOnJS(setCurrentTime)(measuredTime);
      }
    }
    // []
  );

  useEffect(() => {
    const loadSound = async () => {
      const { sound } = await Audio.Sound.createAsync(props.soundUri);
      setSound(sound);

      const status = await sound.getStatusAsync();
      const duration = status["durationMillis"] ?? 0;
      setDuration(duration);
    };

    loadSound()
      .catch((e) => console.log(e))
      .then((_) => console.log("finish loaded sound"));
  }, []);

  useEffect(() => {
    return () => {
      sound?.unloadAsync();
      console.log("unload sound");
    };
  }, [sound]);

  useEffect(() => {
    const resetAudio = async () => {
      console.log("audio shall be over", currentTime, duration);
      setPlaying(false);
      await sound?.pauseAsync();
      dotOffsetX.value = 0;
      await sound?.setPositionAsync(0);
    };
    if (currentTime >= duration && duration) resetAudio();
  }, [currentTime]);

  const startMovingDot = async (pos?: number) => {
    if (!sound) return;
    let newPos: number | undefined = pos;
    if (!newPos) {
      const status = await sound.getStatusAsync();
      newPos = status["positionMillis"];
    }

    const durationLeft = duration - (newPos || 0);
    const newOffset = (() => convertValue(duration, layoutWidth.value, duration))();
    const config = { duration: durationLeft, easing: Easing.linear };
    dotOffsetX.value = withTiming(newOffset, config);
  };

  const setDot = async (pos?: number) => {
    if (!sound) return;
    let newPos = pos;
    if (!newPos) {
      const status = await sound.getStatusAsync();
      newPos = status["positionMillis"];
    }
    dotOffsetX.value = convertValue(duration, layoutWidth.value, newPos || 0);
  };

  const play = async () => {
    if (!sound) return;
    setPlaying((_) => true);
    await sound.playAsync();
    await startMovingDot();
  };

  const pause = async () => {
    if (!sound) return;
    await sound.pauseAsync();
    setPlaying((_) => false);
    const status = await sound.getStatusAsync();

    const newOffset = (() => convertValue(duration, layoutWidth.value, status["positionMillis"]))();
    dotOffsetX.value = newOffset;
  };

  const onPressPlayPause = async () => {
    if (playing) {
      pause();
    } else {
      play();
    }
  };

  const forward5sec = async () => {
    if (!sound) return;
    const status = await sound.getStatusAsync();
    const pos = status["positionMillis"];
    const newPos = Math.min(duration, pos + 5000);
    await sound?.setPositionAsync(newPos);
    await setDot(newPos);
    if (playing) await startMovingDot(newPos);
  };

  const replay5sec = async () => {
    if (!sound) return;
    const status = await sound.getStatusAsync();
    const pos = status["positionMillis"];
    const newPos = Math.max(0, pos - 5000);
    await sound?.setPositionAsync(newPos);
    await setDot(newPos);
    if (playing) await startMovingDot(newPos);
  };

  const animatedThumb = useAnimatedStyle(() => ({ transform: [{ translateX: dotOffsetX.value }] }));

  return (
    <View style={_style.columnLayout}>
      <View
        style={{
          flex: 0,
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          maxWidth: 250,
          height: 20,
          marginHorizontal: 16,
          marginVertical: 10,
        }}
      >
        <Text variant="bodySmall" style={{ color: theme.colors.grey1, width: 40, textAlign: "right", marginRight: 4 }}>
          {formatMsToS(currentTime)}
        </Text>
        {/* slider */}
        <GestureDetector gesture={panGesture}>
          <Animated.View
            onLayout={(e) => {
              const { width } = e.nativeEvent.layout;
              layoutWidth.value = width;
            }}
            style={{
              flex: 8,
              flexDirection: "row",
              justifyContent: "flex-start",
              alignItems: "center",
              position: "relative",
              height: TRACK_SIZE,
              borderRadius: TRACK_SIZE / 2,
              backgroundColor: theme.colors.grey2.concat("33"),
            }}
          >
            <Animated.View
              style={[
                {
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  position: "absolute",
                  left: 0,
                  width: dotOffsetX,
                  borderRadius: TRACK_SIZE / 2,
                  height: "100%",
                  overflow: "hidden",
                },
              ]}
            >
              <LinearGradient colors={theme.colors.gradient} style={_style.gradient} />
            </Animated.View>
            {/* movable thumb (touchable area) */}
            <Animated.View
              style={[
                {
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  position: "absolute",
                  left: -((THUMB_SIZE * 4) / 2),
                  width: THUMB_SIZE * 4,
                  height: THUMB_SIZE * 4,
                },
                animatedThumb,
              ]}
            >
              {/* thumb */}
              <View
                style={{
                  width: THUMB_SIZE,
                  height: THUMB_SIZE,
                  borderRadius: THUMB_SIZE / 2,
                  backgroundColor: theme.colors.grey1,
                }}
              />
            </Animated.View>
          </Animated.View>
        </GestureDetector>
        <Text variant="bodySmall" style={{ color: theme.colors.grey1, width: 40, marginLeft: 4 }}>
          {formatMsToS(duration)}
        </Text>
      </View>
      <View style={_style.rowLayout}>
        <TouchableOpacity onPress={replay5sec}>
          <View style={_style.playBtn}>
            <ReplayIcon fill={theme.colors.highlight} width={50} height={50} />
            <Text variant="bodySmall" style={{ color: theme.colors.highlight, position: "absolute" }}>
              5
            </Text>
          </View>
        </TouchableOpacity>
        <TouchableOpacity onPress={onPressPlayPause}>
          <View style={_style.playBtn}>
            {!playing ? (
              <PlayIcon style={[_style.playIcon, { shadowColor: theme.colors.highlight }]} />
            ) : (
              <PauseIcon style={[_style.playIcon, { shadowColor: theme.colors.highlight }]} />
            )}
          </View>
        </TouchableOpacity>
        <TouchableOpacity onPress={forward5sec}>
          <View style={_style.playBtn}>
            <ForwardIcon fill={theme.colors.highlight} width={50} height={50} />
            <Text variant="bodySmall" style={{ color: theme.colors.highlight, position: "absolute" }}>
              5
            </Text>
          </View>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const TRACK_SIZE = 8;
const THUMB_SIZE = 8;

const _style = StyleSheet.create({
  gradient: {
    position: "absolute",
    width: "100%",
    height: "100%",
  },
  rowLayout: {
    flexDirection: "row",
    alignItems: "center",
    flexShrink: 0,
  },
  columnLayout: {
    flex: 0,
    flexDirection: "column",
    alignContent: "flex-start",
    alignItems: "center",
    justifyContent: "center",
  },
  playBtn: {
    width: 54,
    height: 54,
    alignItems: "center",
    alignContent: "center",
    justifyContent: "center",
    position: "relative",
  },
  playIcon: {
    width: 22,
    height: 26,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 15,
  },
});
