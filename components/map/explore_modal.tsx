import { BottomSheetModal, BottomSheetScrollView } from "@gorhom/bottom-sheet";
import { useMemo, useRef, useEffect, useCallback } from "react";
import { Alert, Dimensions, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Button, Text } from "react-native-paper";
import { ScrollView } from "react-native-gesture-handler";
import { GPSIcon, BookmarkOutlineIcon } from "@components/icons";
import { useAppTheme, AppTheme } from "@providers/style_provider";
import { GeoPoint } from "@/models";
import { useRouter } from "expo-router";
import { distanceFromLatLonInKm } from "@/plugins/geolocation";
import * as ExpoLocation from "expo-location";

interface ExploreModalProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  data: GeoPoint[] | GeoPoint;
  targetIndex?: number;
}

export default function ExploreModal({ open, setOpen, data, targetIndex = 0 }: ExploreModalProps) {
  const { theme } = useAppTheme();
  const style = useStyle(theme);
  const bottomSheetRef = useRef<BottomSheetModal>(null);
  const { top: safeTop } = useSafeAreaInsets();
  const screenHeight = Dimensions.get("window").height;
  const router = useRouter();

  const snapPoints = useMemo(() => ["20%", "50%", screenHeight - safeTop], []);

  useEffect(() => {
    if (open) {
      modalOpen();
    } else {
      modalCLose();
    }
  }, [open]);

  const modalOpen = useCallback(() => {
    bottomSheetRef.current?.present();
  }, []);

  const modalCLose = useCallback(() => {
    bottomSheetRef.current?.dismiss();
  }, []);

  const point: GeoPoint = Array.isArray(data) ? data[targetIndex] : data;

  async function startARTour() {
    const isAttraction = !!point.type;

    const ids = Array.isArray(data) ? data.map(({ _id }) => _id) : [point._id];
    const goTo = () => {
      modalCLose?.();
      router.push({
        pathname: "/ar_explore",
        params: {
          idString: JSON.stringify(ids),
          targetId: targetIndex,
          service: isAttraction ? "attractions" : "locations",
        },
      });
    };
    const { coords: position } = await ExpoLocation.getCurrentPositionAsync();
    if (distanceFromLatLonInKm(position, point) > 5) {
      Alert.alert("> 5km Distance Alert", "You're too far from the destination.\nDo you still want to proceed with the AR tour?", [
        { text: "Cancel", style: "cancel" },
        { text: "Confirm", onPress: goTo },
      ]);
    } else {
      goTo();
    }
  }

  return (
    <View>
      <BottomSheetModal
        backgroundStyle={{ backgroundColor: theme.colors.background }}
        enablePanDownToClose
        ref={bottomSheetRef}
        index={2}
        snapPoints={snapPoints}
        onDismiss={() => setOpen(false)}
      >
        {point && (
          <BottomSheetScrollView style={style.container}>
            <Text variant="headlineSmall">{point.name || point.title}</Text>
            <ScrollView
              alwaysBounceHorizontal={false}
              alwaysBounceVertical={false}
              bounces={false}
              horizontal
              style={{ paddingVertical: theme.spacing.sm }}
            >
              <View style={[style.row, { columnGap: theme.spacing.sm }]}>
                <Button
                  textColor={theme.colors.grey1}
                  mode="contained"
                  icon={() => <GPSIcon fill="white" width={14} height={14} />}
                  labelStyle={style.button}
                  onPress={startARTour}
                >
                  <Text variant="bodyMedium" style={{ color: theme.colors.textOnPrimary }}>
                    Start
                  </Text>
                </Button>
                <Button
                  mode="outlined"
                  icon={() => <BookmarkOutlineIcon fill={theme.colors.primary} width={20} height={20} />}
                  labelStyle={style.button}
                  style={{ borderColor: theme.colors.primary }}
                >
                  <Text variant="bodyMedium" style={{ color: theme.colors.primary }}>
                    Save
                  </Text>
                </Button>
              </View>
            </ScrollView>
            <Text variant="bodyMedium" style={{ color: theme.colors.text }}>
              {point.desc}
            </Text>
          </BottomSheetScrollView>
        )}
      </BottomSheetModal>
    </View>
  );
}

const useStyle = (theme: AppTheme) =>
  StyleSheet.create({
    container: {
      paddingHorizontal: theme.spacing.md,
      paddingVertical: theme.spacing.sm,
      flex: 1,
      flexDirection: "column",
    },
    row: {
      flexDirection: "row",
      alignItems: "center",
      flexShrink: 0,
    },
    column: {
      flexDirection: "column",
      alignContent: "flex-start",
      alignItems: "flex-start",
      justifyContent: "center",
    },
    button: {
      paddingHorizontal: theme.spacing.xs,
      margin: 0,
      maxWidth: 100,
      borderRadius: 100,
    },
  });
