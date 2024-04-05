import { Searchbar, Divider } from "react-native-paper";
import { StyleSheet, View, TouchableOpacity, ScrollView } from "react-native";
import { AppTheme, useAppTheme } from "@providers/style_provider";
import { useRef, useMemo, useCallback, useState, useEffect } from "react";
import { BottomSheetFlatList, BottomSheetModal } from "@gorhom/bottom-sheet";
import { SearchIcon } from "@components/icons";
import ExploreItem from "./explore_item";
import { GeoPoint } from "@/models";

/**
 * @property {boolean} isGrouped determines whether the data is shown as a path (if isGrouped true) or a point. Default is true.
 */
interface Props<T extends GeoPoint> {
  open: boolean;
  setOpen: (open: boolean) => void;
  data: T[];
  isGrouped?: boolean;
}

export default function ExploreListModal<T extends GeoPoint>({ open, setOpen, data, isGrouped = true }: Props<T>) {
  const { theme } = useAppTheme();
  const _style = useStyle({
    theme,
  });

  const bottomSheetRef = useRef<BottomSheetModal>(null);
  //   const bottomSheetScrollRef = useRef<BottomSheetScrollViewMethods | null>(null);
  const snapPoints = useMemo(() => ["75%", "75%"], []);
  const [searchText, setSearchText] = useState("");
  const filteredData: T[] = useMemo(
    () =>
      searchText.length > 0
        ? data.filter((value) => {
            const text = searchText.toLowerCase();
            if (value.name && typeof value.name === "string") {
              const name = value.name.toLowerCase();
              return name.includes(text);
            }
            if (value.type && typeof value.type === "string") {
              return value.type.toLowerCase().includes(text);
            }
            return false;
          })
        : data,
    [data, searchText]
  );

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
        <BottomSheetFlatList
          data={filteredData}
          keyExtractor={(point) => point._id}
          renderItem={({ item }) => (
            <View key={item._id}>
              <ExploreItem isSaved={item.save} points={isGrouped ? data : [item]} id={item._id} modalCLose={modalCLose} />
              <Divider style={{ backgroundColor: theme.colors.grey1, marginHorizontal: -theme.spacing.lg }} />
            </View>
          )}
        />
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
