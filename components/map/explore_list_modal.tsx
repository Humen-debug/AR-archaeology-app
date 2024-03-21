import { Text, Searchbar, Divider } from "react-native-paper";
import { StyleSheet, View, TouchableOpacity } from "react-native";
import { AppTheme, useAppTheme } from "@providers/style_provider";
import { useRef, useMemo, useCallback, useState, useEffect } from "react";
import { BottomSheetModal, BottomSheetScrollView, BottomSheetScrollViewMethods } from "@gorhom/bottom-sheet";
import { SearchIcon } from "@components/icons";
import ExploreItem from "./explore_item";
import { GeoPoint } from "@/models";

interface Props<T extends GeoPoint> {
  open: boolean;
  setOpen: (open: boolean) => void;
  data: T[];
}

export default function ExploreListModal<T extends GeoPoint>({ open, setOpen, data }: Props<T>) {
  const { theme } = useAppTheme();
  const _style = useStyle({
    theme,
  });

  const bottomSheetRef = useRef<BottomSheetModal>(null);
  //   const bottomSheetScrollRef = useRef<BottomSheetScrollViewMethods | null>(null);
  const snapPoints = useMemo(() => ["75%", "75%"], []);

  const [searchText, setSearchText] = useState("");

  useEffect(() => {
    if (open) {
      modalOpen();
    }
  }, [open]);

  const modalOpen = useCallback(() => {
    bottomSheetRef.current?.present();
  }, []);

  const modalCLose = useCallback(() => {
    bottomSheetRef.current?.dismiss();
  }, []);

  const modalToggle = () => {
    if (open) {
      modalCLose();
    } else {
      setOpen(true);
      modalOpen();
    }
  };

  // TODO
  const onSubmit = () => {
    console.log("filterList", searchText);
  };

  if (!open) return <></>;
  return (
    <View style={{ ..._style.fill, position: "absolute" }}>
      {open && <TouchableOpacity style={_style.fill} onPress={modalToggle} />}
      <BottomSheetModal
        backgroundStyle={{ backgroundColor: theme.colors.background }}
        enablePanDownToClose
        ref={bottomSheetRef}
        index={1}
        snapPoints={snapPoints}
        onDismiss={() => setOpen(false)}
      >
        <View style={{ paddingHorizontal: theme.spacing.lg }}>
          <Searchbar
            placeholder="Search"
            value={searchText}
            onChangeText={setSearchText}
            onSubmitEditing={onSubmit}
            mode="bar"
            icon={() => null}
            elevation={0}
            style={_style.searchbar}
            iconColor={theme.colors.text}
            traileringIconColor={theme.colors.text}
            traileringIcon={({ color }) => <SearchIcon fill={color || theme.colors.text} />}
          />
          <Divider style={{ backgroundColor: theme.colors.grey3, marginHorizontal: -theme.spacing.lg }} />
        </View>
        <BottomSheetScrollView contentContainerStyle={{ flex: 1 }} showsVerticalScrollIndicator={false}>
          <View style={_style.list}>
            {data.map(({ save, _id }) => (
              <View key={_id}>
                <ExploreItem isSaved={save} points={data} id={_id} modalCLose={modalCLose} />
                <Divider style={{ backgroundColor: theme.colors.grey1, marginHorizontal: -theme.spacing.lg }} />
              </View>
            ))}
          </View>
        </BottomSheetScrollView>
      </BottomSheetModal>
    </View>
  );
}

const useStyle = ({ theme }: { theme: AppTheme }) =>
  StyleSheet.create({
    searchbar: {
      flexGrow: 1,
      flexShrink: 1,
      backgroundColor: theme.colors.container,
      borderRadius: 4,
      marginHorizontal: theme.spacing.lg,
      marginBottom: theme.spacing.lg,
    },
    fill: {
      height: "100%",
      width: "100%",
    },
    list: {
      flex: 1,
      overflow: "hidden",
      flexDirection: "column",
    },
    item: {
      paddingVertical: theme.spacing.md,
      paddingHorizontal: theme.spacing.lg,
    },
  });
