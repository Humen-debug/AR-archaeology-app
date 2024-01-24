import { Text, Button } from "react-native-paper";
import { StyleSheet, View, FlatList, Image } from "react-native";
import { Dimensions } from "react-native";
import { useAppTheme } from "@styles";
import GPSIcon from "@assets/icons/gps.svg";
import BookMarkOutlineIcon from "@assets/icons/bookmark-outline.svg";
import BookMarkIcon from "@assets/icons/bookmark.svg";

interface ItemProps {
  title: string;
  length?: number; // in km
  isSaved?: boolean;
  images?: string[] | null;
}

export default function ExploreItem(item: ItemProps) {
  const { title, length, isSaved, images } = item;
  const theme = useAppTheme();

  const itemWidth = 270;
  const window = { height: Dimensions.get("window").height, width: Dimensions.get("window").width };
  const _style = useStyle({
    backgroundColor: theme.colors.grey4 + "e9",
    labelGrey: theme.colors.label,
    spacing: theme.spacing,
    itemWidth,
    window,
    withImage: !!images,
  });

  return (
    <View style={_style.item}>
      <>
        <Text variant="labelMedium">{title}</Text>
        <Text variant="labelSmall" style={_style.lengthText}>
          {length} km
        </Text>
        {images && (
          <FlatList
            horizontal
            ItemSeparatorComponent={() => <View style={{ width: theme.spacing.sm }} />}
            data={images}
            renderItem={({ item }) => (
              <Image
                style={_style.image}
                source={{
                  uri: item,
                }}
              />
            )}
          />
        )}
      </>
      <View style={{ display: "flex", flexDirection: "row" }}>
        <Button
          compact
          labelStyle={_style.button}
          textColor={theme.colors.grey1}
          mode="contained"
          icon={() => <GPSIcon fill="white" style={_style.icon} />}
        >
          <Text variant="labelSmall">Start</Text>
        </Button>
        <Button
          compact
          labelStyle={_style.button}
          mode="outlined"
          icon={() =>
            isSaved ? (
              <BookMarkIcon style={_style.icon} fill={theme.colors.primary} />
            ) : (
              <BookMarkOutlineIcon style={_style.icon} fill={theme.colors.primary} />
            )
          }
          style={{ marginLeft: 8, borderColor: theme.colors.primary }}
        >
          <Text variant="labelSmall" style={{ color: theme.colors.primary }}>
            {isSaved ? "Saved" : "Save"}
          </Text>
        </Button>
      </View>
    </View>
  );
}

const useStyle = ({ backgroundColor, spacing, itemWidth, labelGrey, window, withImage }: any) =>
  StyleSheet.create({
    image: {
      height: 100,
      width: 160,
      borderRadius: 8,
      marginTop: spacing.xs,
      marginBottom: spacing.sm,
    },
    item: {
      backgroundColor: backgroundColor,
      height: withImage ? undefined : 96,
      borderRadius: spacing.xs,
      paddingHorizontal: spacing.lg,
      paddingVertical: spacing.sm,
      justifyContent: "space-between",
    },
    button: {
      marginVertical: 4,
      fontSize: 8,
    },
    icon: {
      maxHeight: 16,
      marginHorizontal: -6,
    },
    lengthText: {
      color: labelGrey,
      marginTop: withImage ? 0 : -9,
    },
  });
