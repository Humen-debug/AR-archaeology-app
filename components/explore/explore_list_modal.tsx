import { Text, Searchbar, Divider } from "react-native-paper";
import { StyleSheet, View, TouchableOpacity } from "react-native";
import { useAppTheme } from "@styles";
import { useRef, useMemo, useCallback, useState, useEffect } from "react";
import { BottomSheetModal, BottomSheetScrollView, BottomSheetScrollViewMethods } from "@gorhom/bottom-sheet";
import { SearchIcon } from "@/components/icons";
import ExploreItem from "./explore_item";

export default function ExploreListModal({ open, setOpen, data }: { open: boolean; setOpen: (open: boolean) => void; data: any[] }) {
  const theme = useAppTheme();
  const _style = useStyle({
    spacing: theme.spacing,
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

  const onSubmit = () => {
    console.log("filterList", searchText);
  };

  if (!open) return <></>;
  return (
    <View style={{ ..._style.fill, position: "absolute" }}>
      {open && <TouchableOpacity style={_style.fill} onPress={modalToggle} />}
      <BottomSheetModal
        backgroundStyle={{ backgroundColor: theme.colors.grey4 }}
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
            iconColor={theme.colors.grey1}
            traileringIconColor={theme.colors.grey1}
            traileringIcon={({ color }) => <SearchIcon fill={color || theme.colors.grey1} />}
          />
          <Divider style={{ backgroundColor: "black", marginHorizontal: -theme.spacing.lg }} />
        </View>
        <BottomSheetScrollView contentContainerStyle={{ flex: 1 }} showsVerticalScrollIndicator={false}>
          <View style={_style.list}>
            {data.map(({ title, length, save, images, id }, index) => (
              <View key={index}>
                <ExploreItem title={title} length={length} isSaved={save} images={images} POINTS={data} id={index} modalCLose={modalCLose} />
                <Divider style={{ backgroundColor: "black", marginHorizontal: -theme.spacing.lg }} />
              </View>
            ))}
          </View>
        </BottomSheetScrollView>
      </BottomSheetModal>
    </View>
  );
}

const useStyle = ({ spacing }: any) =>
  StyleSheet.create({
    searchbar: {
      flexGrow: 1,
      flexShrink: 1,
      backgroundColor: "#6D6D6D33",
      borderRadius: 4,
      marginHorizontal: spacing.lg,
      marginBottom: spacing.lg,
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
      paddingVertical: spacing.md,
      paddingHorizontal: spacing.lg,
    },
  });
