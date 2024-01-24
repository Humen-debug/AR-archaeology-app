import { BottomSheetModal, BottomSheetScrollView } from "@gorhom/bottom-sheet";
import { useMemo, useRef, useEffect, useCallback } from "react";
import { Dimensions, StyleSheet, View } from "react-native";
import { AppTheme, useAppTheme } from "@styles";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Button, Text } from "react-native-paper";
import { ScrollView } from "react-native-gesture-handler";
import { GPSIcon, BookmarkOutlineIcon } from "@components/icons";

interface ExploreModalProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  data: any;
}

export default function ExploreModal({ open, setOpen, data }: ExploreModalProps) {
  const theme = useAppTheme();
  const style = useStyle(theme);
  const bottomSheetRef = useRef<BottomSheetModal>(null);
  const { top: safeTop } = useSafeAreaInsets();
  const screenHeight = Dimensions.get("window").height;

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

  return (
    <View>
      <BottomSheetModal
        backgroundStyle={{ backgroundColor: theme.colors.grey4 }}
        enablePanDownToClose
        ref={bottomSheetRef}
        index={2}
        snapPoints={snapPoints}
        onDismiss={() => setOpen(false)}
      >
        {data && (
          <BottomSheetScrollView style={style.container}>
            <Text variant="headlineSmall">{data.name || data.title}</Text>
            <ScrollView horizontal style={{ paddingVertical: theme.spacing.sm }}>
              <View style={[style.row, { columnGap: theme.spacing.sm }]}>
                <Button
                  textColor={theme.colors.grey1}
                  mode="contained"
                  icon={() => <GPSIcon fill="white" width={14} height={14} />}
                  labelStyle={style.button}
                >
                  <Text variant="bodyMedium">Start</Text>
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
            <Text>{data.desc}</Text>
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
