import { Text, Button } from "react-native-paper";
import { StyleSheet, View, FlatList, Image } from "react-native";
import { useAppTheme } from "@styles";
import { GPSIcon, BookmarkIcon, BookmarkOutlineIcon } from "@/components/icons";
import { useRouter } from "expo-router";

interface ItemProps {
  title: string;
  length?: number; // in km
  isSaved?: boolean;
  images?: string[] | null;
  POINTS: any[];
  id: number;
  modalCLose: () => void;
}

export default function ExploreItem(item: ItemProps) {
  const { title, length = 10, isSaved, images, modalCLose } = item;
  const router = useRouter();
  const theme = useAppTheme();

  const _style = useStyle({
    backgroundColor: theme.colors.grey4 + "e9",
    labelGrey: theme.colors.label,
    spacing: theme.spacing,
    withImage: !!images,
  });

  const fetchNextPoints = () => {
    if (modalCLose) modalCLose();
    const POINTSString = item.POINTS.map(({ _id, latitude, longitude }) => {
      return { _id, latitude, longitude }; // Removed desc and title as it is unused
    });
    router.push({ pathname: "/ar_explore", params: { POINTS: JSON.stringify(POINTSString), targetId: item.id } });
  };

  return (
    <View style={_style.item}>
      <>
        <Text variant="labelLarge">{title}</Text>
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
      <View style={{ display: "flex", flexDirection: "row" }}>
        <Button
          compact
          contentStyle={_style.button}
          textColor={theme.colors.grey1}
          mode="contained"
          icon={() => <GPSIcon fill="white" style={_style.icon} />}
          onPress={fetchNextPoints}
        >
          <Text variant="labelLarge">Start</Text>
        </Button>
        <Button
          compact
          contentStyle={_style.button}
          mode="outlined"
          icon={() =>
            isSaved ? (
              <BookmarkIcon style={_style.icon} fill={theme.colors.primary} />
            ) : (
              <BookmarkOutlineIcon style={_style.icon} fill={theme.colors.primary} />
            )
          }
          style={{ marginLeft: 8, borderColor: theme.colors.primary }}
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
      marginHorizontal: 16,
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
