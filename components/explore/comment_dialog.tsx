import { useAppTheme } from "@/providers/style_provider";
import { AppTheme } from "@/styles";
import { useState } from "react";
import { Platform, StyleSheet, useWindowDimensions, View } from "react-native";
import { Button, Text, TextInput } from "react-native-paper";

export interface Props {
  setOpen: (value: boolean) => void;
  setComment: (value: string) => void;
}

export default function CommentDialog({ setOpen, ...props }: Props) {
  const { theme } = useAppTheme();
  const style = useStyle({ theme });
  const { width: screenWidth } = useWindowDimensions();

  const [comment, setComment] = useState("");

  const isIOS = Platform.OS === "ios";
  const maxCharacters = 280;
  const disabled = comment.length <= 0 || comment.length >= maxCharacters;

  const _onCancel = () => {
    setOpen(false);
  };

  const _onConfirm = () => {
    props.setComment(comment);
    setOpen(false);
  };
  return (
    <View style={[style.dialog, { width: screenWidth - theme.spacing.xl }, isIOS ? { justifyContent: "center" } : {}]}>
      <Text variant="titleMedium" style={{ color: theme.colors.text }}>
        Leave a Comment!
      </Text>
      <TextInput
        label={"Comment"}
        mode="outlined"
        theme={{ ...theme, colors: { background: theme.colors.container } }}
        outlineColor={theme.colors.grey4}
        value={comment}
        onChangeText={setComment}
      />
      <View style={[style.rowLayout, isIOS ? { justifyContent: "center" } : { justifyContent: "flex-end" }]}>
        <Button mode="text" onPress={_onCancel}>
          <Text variant="labelLarge" style={{ color: theme.colors.primary }}>
            Cancel
          </Text>
        </Button>
        <Button mode="text" disabled={disabled} onPress={_onConfirm}>
          <Text variant="labelLarge" style={{ color: theme.colors.primary, fontWeight: "bold" }}>
            OK
          </Text>
        </Button>
      </View>
    </View>
  );
}

const useStyle = ({ theme }: { theme: AppTheme }) =>
  StyleSheet.create({
    rowLayout: {
      flexDirection: "row",
      alignItems: "center",
      flexShrink: 0,
    },
    columnLayout: {
      flexDirection: "column",
      alignContent: "flex-start",
      alignItems: "flex-start",
      justifyContent: "center",
    },
    columnCenterLayout: {
      flexDirection: "column",
      alignContent: "center",
      alignItems: "center",
      justifyContent: "center",
    },

    bottomSheetShadow: {
      shadowColor: "#000000",
      shadowOffset: { width: 0, height: -32 },
      shadowOpacity: 0.2,
      shadowRadius: 16,
    },
    centerContainer: {
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      justifyContent: "center",
      alignItems: "center",
    },

    dialog: {
      borderRadius: theme.borderRadius.md,
      backgroundColor: theme.colors.container,
      overflow: "hidden",
      flexDirection: "column",
      paddingHorizontal: theme.spacing.lg,
      paddingVertical: theme.spacing.md,
    },
  });
