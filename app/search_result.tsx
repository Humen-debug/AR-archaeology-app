import { Checkbox, List, RadioButton, Searchbar, Text } from "react-native-paper";
import { useAppTheme } from "../styles";
import MainBody from "../components/main_body";
import { View, StyleSheet } from "react-native";
import { ForwardedRef, forwardRef, useEffect, useMemo, useRef, useState } from "react";
import SearchIcon from "../assets/icons/search.svg";
import ChevronLeftIcon from "../assets/icons/chevron-left.svg";

import SortIcon from "../assets/icons/sort.svg";
import { Artifact } from "../models/artifact";
import { FlatList, TouchableOpacity } from "react-native-gesture-handler";
import { router, useLocalSearchParams } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ItemCard } from "../components/item_card";
import { BottomSheetModal, BottomSheetModalProvider, BottomSheetScrollView } from "@gorhom/bottom-sheet";
import { useQuery } from "../models";

export default function SearchResultPage() {
  const theme = useAppTheme();
  const params = useLocalSearchParams<{ q?: string }>();
  const [searchText, setSearchText] = useState(params.q || "");
  const [sortBy, setSortBy] = useState("");
  const [filters, setFilters] = useState<any[]>([]);
  const bottomSheetModalRef = useRef<BottomSheetModal>(null);
  const snapPoints = useMemo(() => ["45%", "65%"], []);
  const [allItems, setAllItems] = useState<Realm.Results<Artifact>>();
  const items = useQuery(Artifact);

  const isEmptyResult = useMemo(() => allItems?.length === 0, [allItems]);

  // on init, filter items by search text
  useEffect(() => {
    searchItems(searchText);
  }, [params.q]);

  const onSubmit = (e) => {
    e.preventDefault();
    router.setParams({ q: searchText });
    router.push(`/search_result?q=${searchText}`);
  };

  const searchItems = (text: string) => {
    const filtered = items.filtered(`name CONTAINS[c] $0`, text);
    setAllItems(filtered);
  };

  return (
    <MainBody backgroundColor={theme.colors.gradientBackground} padding={{ top: 0 }}>
      <>
        <View
          style={[
            _style.header,
            {
              backgroundColor: theme.colors.background,
              paddingTop: useSafeAreaInsets().top,
              padding: theme.spacing.md,
              gap: theme.spacing.sm,
            },
          ]}
        >
          <TouchableOpacity onPress={() => router.back()}>
            <ChevronLeftIcon fill="white" />
          </TouchableOpacity>
          {/* NOTE: only after submitting the search text will activate search engine.
              And it will push to new search result page
            */}
          <Searchbar
            placeholder="Search"
            value={searchText}
            onChangeText={setSearchText}
            onSubmitEditing={onSubmit}
            mode="bar"
            icon={() => null}
            elevation={0}
            style={{ flexGrow: 1, flexShrink: 1, backgroundColor: "#6D6D6D33", borderRadius: 4, paddingRight: 0 }}
            iconColor={theme.colors.grey1}
            traileringIconColor={theme.colors.grey1}
            traileringIcon={({ color }) => <SearchIcon fill={color || theme.colors.grey1} />}
          />
          <TouchableOpacity
            onPress={() => {
              bottomSheetModalRef.current?.present();
            }}
          >
            <SortIcon fill="white" />
          </TouchableOpacity>
        </View>

        {isEmptyResult ? (
          <View style={_style.columnLayout}></View>
        ) : (
          <FlatList
            showsVerticalScrollIndicator={false}
            data={allItems}
            renderItem={({ item }) => (
              <ItemCard
                item={item}
                onPress={() => {
                  router.push(`/detail?id=${item._id}`);
                  bottomSheetModalRef.current?.dismiss();
                }}
              />
            )}
            columnWrapperStyle={{ gap: theme.spacing.sm, paddingBottom: theme.spacing.md, justifyContent: "flex-start" }}
            numColumns={2}
            keyExtractor={(item, index) => item._id.toString()}
            style={{ padding: theme.spacing.md }}
          />
        )}
        <SortFilterSheet
          sortBy={sortBy}
          setSortBy={setSortBy}
          snapPoints={snapPoints}
          filters={filters}
          setFilter={(item) => {
            setFilters((old) => {
              const items = [...old];
              const idx = items.indexOf(item);

              if (idx === -1) {
                items.push(item);
              } else {
                items.splice(idx, 1);
              }

              return items;
            });
          }}
          ref={bottomSheetModalRef}
        />
      </>
    </MainBody>
  );
}

interface SortFilterSheetProps<T> {
  setSortBy: (value: string) => void;
  sortBy: string;
  filters: string[];
  setFilter: (value: string) => void;
  snapPoints?: (string | number)[] | undefined;
}

const SortFilterSheet = forwardRef(function SortFilterSheet<T>(props: SortFilterSheetProps<T>, ref: ForwardedRef<BottomSheetModal>) {
  const theme = useAppTheme();

  const sortOptions = [
    { label: "Relevance", value: "1" },
    { label: "Newest First", value: "2" },
    { label: "Oldest First", value: "3" },
  ];

  const filterOpts = [
    {
      title: "Types",
      items: [
        { title: "Type 1", value: "type1" },
        { title: "Type 2", value: "type2" },
      ],
    },
    {
      title: "Locations",
      items: [
        { title: "Location 1", value: "location1" },
        { title: "Location 2", value: "location2" },
      ],
    },
  ];

  return (
    <BottomSheetModal ref={ref} snapPoints={props.snapPoints} backgroundStyle={{ backgroundColor: theme.colors.grey4 }}>
      <BottomSheetScrollView
        contentContainerStyle={[_style.bottomSheetContainer, { paddingHorizontal: theme.spacing.lg, paddingBottom: theme.spacing.xl }]}
      >
        <Text variant="titleSmall" style={[_style.wrapper, { paddingBottom: theme.spacing.lg }]}>
          Sort By
        </Text>
        <RadioButton.Group onValueChange={props.setSortBy} value={props.sortBy}>
          <View style={[_style.wrapper]}>
            <>
              {sortOptions.map(({ label, value }) => (
                <RadioButton.Item
                  label={label}
                  value={value}
                  key={value}
                  mode="android"
                  position="leading"
                  color={theme.colors.highlight}
                  style={{ paddingVertical: theme.spacing.xs, paddingLeft: 0 }}
                />
              ))}
            </>
          </View>
        </RadioButton.Group>
        <View style={{ height: theme.spacing.lg * 2 }} />
        <Text variant="titleSmall" style={[_style.wrapper, { paddingBottom: theme.spacing.lg }]}>
          Filter By
        </Text>
        <List.AccordionGroup>
          <>
            {filterOpts.map((value, index) => (
              <List.Accordion
                key={index}
                title={value.title}
                id={index}
                theme={{ colors: { background: "transparent" } }}
                titleStyle={{ color: theme.colors.grey1 }}
              >
                {value.items.map((value, index: number) => {
                  const status: CheckboxStatus = props.filters.includes(value.value) ? "checked" : "unchecked";
                  return (
                    <List.Item
                      key={`${value.value}${index}`}
                      title={value.title}
                      left={() => <Checkbox.Android status={status} color={theme.colors.highlight} />}
                      style={{ paddingLeft: theme.spacing.xs }}
                      onPress={() => {
                        props.setFilter(value.value);
                      }}
                    />
                  );
                })}
              </List.Accordion>
            ))}
          </>
        </List.AccordionGroup>
      </BottomSheetScrollView>
    </BottomSheetModal>
  );
});

type CheckboxStatus = "unchecked" | "checked" | "indeterminate";

const _style = StyleSheet.create({
  gradient: {
    flex: 1,
    justifyContent: "center",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    overflow: "hidden",
  },
  bottomSheetContainer: {
    flex: 1,
    flexDirection: "column",
  },
  wrapper: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  columnLayout: {
    flexDirection: "column",
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
