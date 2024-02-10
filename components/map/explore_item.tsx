import { Text, Button } from "react-native-paper";
import { StyleSheet, View, FlatList, Image } from "react-native";
import { useAppTheme } from "@providers/style_provider";
import { GPSIcon, BookmarkIcon, BookmarkOutlineIcon } from "@components/icons";
import { useRouter } from "expo-router";

interface ItemProps {
  title: string;
  length?: number; // in km
  isSaved?: boolean;
  images?: string[] | null;
  points: any[];
  id: number;
  modalCLose?: () => void;
}

export default function ExploreItem(item: ItemProps) {
  const { title, length = 10, isSaved, images, modalCLose } = item;
  const router = useRouter();
  const { theme } = useAppTheme();

  const _style = useStyle({
    backgroundColor: theme.colors.container + "e9",
    labelGrey: theme.colors.text,
    spacing: theme.spacing,
    withImage: !!images,
  });

  const fetchNextPoints = () => {
    if (modalCLose) modalCLose();
    const POINTSString = item.points.map(({ _id, latitude, longitude }) => {
      return { _id, latitude, longitude }; // Removed desc and title as it is unused
    });
    router.push({ pathname: "/ar_explore", params: { POINTS: JSON.stringify(POINTSString), targetId: item.id } });
  };

  return (
    <View style={_style.item}>
      <>
        <Text variant="labelLarge" style={{ color: theme.colors.text }}>
          {title}
        </Text>
        {length && (
          <Text variant="labelMedium" style={_style.lengthText}>
            {length} km
          </Text>
        )}
        {images && (
          <FlatList
            horizontal
            ItemSeparatorComponent={() => <View style={{ width: theme.spacing.sm }} />}
            data={images}
            renderItem={({ item }) => <Image style={_style.image} source={{ uri: item }} />}
          />
        )}
      </>
      <View style={{ display: "flex", flexDirection: "row", columnGap: theme.spacing.xs }}>
        <Button
          compact
          style={[_style.button, { borderRadius: 999 }]}
          textColor={theme.colors.textOnPrimary}
          mode="contained"
          icon={() => <GPSIcon fill={theme.colors.textOnPrimary} style={_style.icon} />}
          onPress={fetchNextPoints}
        >
          <Text variant="labelLarge" style={{ color: theme.colors.textOnPrimary }}>
            Start
          </Text>
        </Button>
        <Button
          compact
          style={{ borderWidth: 2, borderRadius: 999, borderColor: theme.colors.primary }}
          mode="outlined"
          icon={() =>
            isSaved ? (
              <BookmarkIcon style={_style.icon} fill={theme.colors.primary} />
            ) : (
              <BookmarkOutlineIcon style={_style.icon} fill={theme.colors.primary} />
            )
          }
          contentStyle={_style.button}
        >
          <Text variant="labelLarge" style={{ color: theme.colors.primary }}>
            {isSaved ? "Saved" : "Save"}
          </Text>
        </Button>
      </View>
    </View>
  );
}

const useStyle = ({ backgroundColor, spacing, labelGrey, withImage, itemWidth }: any) =>
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
      height: withImage ? undefined : 120,
      borderRadius: spacing.xs,
      paddingHorizontal: spacing.lg,
      paddingVertical: spacing.sm,
      justifyContent: "space-between",
      width: itemWidth,
    },
    button: {
      paddingHorizontal: 16,
      flexDirection: "row",
      alignContent: "center",
      justifyContent: "center",
      alignItems: "center",
    },
    icon: {
      // maxHeight: 16,
      // marginHorizontal: -6,
    },
    lengthText: {
      color: labelGrey,
      marginTop: withImage ? 8 : -8,
    },
  });
