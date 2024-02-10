import { Button, Text } from "react-native-paper";
import { MainBody } from "@components";
import { View, StyleSheet, ImageBackground, useWindowDimensions, Pressable } from "react-native";
import { useState } from "react";
import { AppTheme, useAppTheme } from "@providers/style_provider";
import { useAuth } from "@providers/auth_provider";
import { Link, router } from "expo-router";
import MapPreview from "@/components/map/map_preview";

const DECORATE_BOX_HEIGHT = 114;

export default function Home() {
  const { theme } = useAppTheme();
  const { width: screenWidth } = useWindowDimensions();
  const [topSectionHeight, setTopSectionHeight] = useState(0);

  const style = useStyle({ theme, screenWidth });

  const { user } = useAuth();
  const authenticated = user && user._id;

  return (
    <MainBody>
      <View
        style={{
          height: topSectionHeight,
          backgroundColor: theme.colors.container,
          top: DECORATE_BOX_HEIGHT - theme.spacing.lg,
          left: 0,
          right: 0,
          position: "absolute",
          elevation: 4,
        }}
      />
      <View style={style.appBarDecorateBox} />
      <View style={{ flexDirection: "column", paddingTop: theme.spacing.md, paddingBottom: theme.spacing.xs, paddingHorizontal: theme.spacing.lg }}>
        <Text variant="titleMedium" style={{ color: theme.colors.background }}>
          {authenticated ? "Let’s have fun in Vedi Valley!" : "Welcome to Vedi Valley"}
        </Text>
      </View>

      {/* Top Section */}
      <View
        onLayout={(e) => {
          const { height } = e.nativeEvent.layout;
          setTopSectionHeight(height);
        }}
        style={{
          flexDirection: "column",
          rowGap: theme.spacing.sm,
          paddingHorizontal: theme.spacing.lg,
          paddingBottom: theme.spacing.sm,
        }}
      >
        <Link href="/home/history" asChild>
          <Pressable style={{ elevation: 12 }}>
            <ImageBackground source={require("@assets/images/vedi.jpg")} style={[style.thumbnail]} imageStyle={style.image}>
              <View style={{ top: theme.spacing.sm, left: theme.spacing.sm, position: "absolute" }}>
                <Text variant="labelLarge" style={style.label}>
                  Explore the History
                </Text>
              </View>
            </ImageBackground>
          </Pressable>
        </Link>

        <View style={{ columnGap: theme.spacing.md, rowGap: theme.spacing.sm, flexDirection: "row", flexWrap: "wrap" }}>
          <Link href={{ pathname: "/home/attractions", params: { type: "Attraction" } }} asChild>
            <Pressable style={style.subThumbContainer}>
              <ImageBackground source={require("@assets/images/attractions.png")} imageStyle={style.image}>
                <View style={style.subThumb}>
                  <Text variant="labelLarge" style={[style.label, { top: theme.spacing.xxs, left: theme.spacing.xs, position: "absolute" }]}>
                    Attractions
                  </Text>
                </View>
              </ImageBackground>
            </Pressable>
          </Link>
          <Link href="/home/livings" asChild>
            <Pressable style={style.subThumbContainer}>
              <ImageBackground source={require("@assets/images/food.png")} imageStyle={style.image}>
                <View style={style.subThumb}>
                  <Text variant="labelLarge" style={[style.label, { top: theme.spacing.xxs, right: theme.spacing.xs, position: "absolute" }]}>
                    Food & Lodging
                  </Text>
                </View>
              </ImageBackground>
            </Pressable>
          </Link>
          <Link href="/home/hiking" asChild>
            <Pressable style={style.subThumbContainer}>
              <ImageBackground source={require("@assets/images/hiking.png")} imageStyle={style.image}>
                <View style={style.subThumb}>
                  <Text variant="labelLarge" style={[style.label, { bottom: theme.spacing.xxs, left: theme.spacing.xs, position: "absolute" }]}>
                    Hiking
                  </Text>
                </View>
              </ImageBackground>
            </Pressable>
          </Link>
          <Link href="/home/events" asChild>
            <Pressable style={style.subThumbContainer}>
              <ImageBackground source={require("@assets/images/events.png")} imageStyle={style.image}>
                <View style={style.subThumb}>
                  <Text variant="labelLarge" style={[style.label, { bottom: theme.spacing.xxs, right: theme.spacing.xs, position: "absolute" }]}>
                    Events
                  </Text>
                </View>
              </ImageBackground>
            </Pressable>
          </Link>
        </View>
      </View>
      {/* Login / Favorite Place*/}
      <View
        style={{
          paddingHorizontal: theme.spacing.lg,
          marginVertical: theme.spacing.lg,
          flexDirection: "column",
          gap: theme.spacing.sm,
          flexGrow: 1,
          flexShrink: 0,
        }}
      >
        {!authenticated ? (
          <View style={{ flexDirection: "column", gap: theme.spacing.sm }}>
            <Text variant="bodyMedium" style={{ color: theme.colors.grey3 }}>
              Please login or create an account for more information.
            </Text>
            <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
              <Button mode="contained" style={{ borderRadius: theme.spacing.xs }} onPress={() => router.push("/login")}>
                Login
              </Button>
              <Button
                mode="outlined"
                style={{ borderRadius: theme.spacing.xs, borderColor: theme.colors.primary, borderWidth: 2 }}
                onPress={() => router.push("/register")}
              >
                Sign up
              </Button>
            </View>
          </View>
        ) : (
          <Button mode="contained" style={{ width: "100%", borderRadius: theme.spacing.xs }}>
            <Text variant="labelLarge" style={{ color: theme.colors.textOnPrimary }}>
              Your Favorite Places
            </Text>
          </Button>
        )}
        <View style={style.divider} />
      </View>

      {/* Map */}
      <View style={{ flexGrow: 0, flexShrink: 1 }}>
        <MapPreview points={[]} style={[style.mapContainer, style.fill]} />
        <View style={{ position: "absolute", top: theme.spacing.md, right: theme.spacing.sm }}>
          <Text variant="titleMedium" style={style.mapLabel}>
            Map of Valley
          </Text>
        </View>
      </View>
    </MainBody>
  );
}

const useStyle = ({ theme, screenWidth }: { theme: AppTheme; screenWidth: number }) =>
  StyleSheet.create({
    appBarDecorateBox: {
      backgroundColor: theme.colors.primary,
      borderBottomRightRadius: theme.borderRadius.lg,
      borderBottomLeftRadius: theme.borderRadius.lg,
      position: "absolute",
      height: DECORATE_BOX_HEIGHT,
      top: 0,
      left: 0,
      right: 0,
    },
    thumbnail: {
      height: (screenWidth - theme.spacing.lg * 2) * 0.42,
      borderRadius: theme.spacing.xs,
      width: "100%",
      overflow: "hidden",
    },
    subThumbContainer: {
      borderRadius: theme.spacing.xs,
      overflow: "hidden",
      height: (((screenWidth - theme.spacing.lg * 2 - theme.spacing.md) / 2) * 9) / 16,
      width: (screenWidth - theme.spacing.lg * 2 - theme.spacing.md) / 2,
      position: "relative",
      elevation: 8,
    },
    subThumb: {
      width: "100%",
      height: "100%",
      position: "relative",
    },
    image: {
      width: "100%",
      height: "100%",
      resizeMode: "cover",
    },
    label: {
      color: theme.colors.white,
      textShadowColor: theme.colors.shadow,
    },
    mapContainer: {
      overflow: "hidden",
    },
    fill: {
      width: "100%",
      height: "100%",
    },
    divider: {
      height: 1,
      width: "100%",
      backgroundColor: theme.colors.grey4,
    },
    mapLabel: {
      color: "white",
      textShadowColor: "black",
      textShadowRadius: 8,
      elevation: 8,
    },
  });
