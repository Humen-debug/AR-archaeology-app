import { useAppTheme } from "@/providers/style_provider";
import { Pressable, View } from "react-native";
import { Icons } from "@components";
import { Text } from "react-native-paper";
import { ChevronRightSharpIcon } from "../icons";

/** @param prefix and suffix typeof string is referring to the keys in Icons components */
export interface Props {
  prefix?: string | React.ReactNode | ((props: Icons.IconProps) => React.ReactNode);
  label: string;
  suffix?: string | React.ReactNode | ((props: Icons.IconProps) => React.ReactNode);
  onPress?: () => void;
}

export default function ListItem({ prefix, label, suffix, onPress }: Props) {
  const { theme } = useAppTheme();

  let PrefixIcon: ((props: Icons.IconProps) => React.ReactNode) | undefined, SuffixIcon: ((props: Icons.IconProps) => React.ReactNode) | undefined;
  if (typeof prefix === "string") {
    let key: string = prefix;
    if (!key.endsWith("Icon")) key += "Icon";
    key = key[0].toUpperCase() + key.substring(1);
    PrefixIcon = Icons[key];
    if (!PrefixIcon) throw Error(`Icons does not support key '${key}'. Do you forget to add new icon to "@components/icons"?`);
  } else if (typeof prefix === "function") {
    PrefixIcon = prefix;
  } else if (!!prefix) {
    PrefixIcon = (props: Icons.IconProps) => prefix;
  }
  if (typeof suffix === "string") {
    let key: string = suffix;
    if (!key.endsWith("Icon")) key += "Icon";
    key = key[0].toUpperCase() + key.substring(1);
    SuffixIcon = Icons[key];
    if (!SuffixIcon) throw Error(`Icons does not support key '${key}'. Do you forget to add new icon to "@components/icons"?`);
  } else if (typeof suffix === "function") {
    SuffixIcon = suffix;
  } else if (!!suffix) {
    SuffixIcon = (props: Icons.IconProps) => suffix;
  }

  if (!SuffixIcon) {
    SuffixIcon = (props: Icons.IconProps) => <ChevronRightSharpIcon {...props} />;
  }
  return (
    <Pressable onPress={onPress}>
      <View
        style={{
          paddingHorizontal: theme.spacing.md,
          paddingVertical: theme.spacing.sm,
          borderRadius: theme.borderRadius.xs,
          overflow: "hidden",
          flexDirection: "row",
          alignItems: "center",
          backgroundColor: theme.colors.container,
          elevation: 4,
        }}
      >
        {PrefixIcon && <PrefixIcon fill={theme.colors.text} size={24} style={{ marginRight: theme.spacing.md }} />}
        <Text variant="labelMedium" style={{ color: theme.colors.text, flex: 1 }}>
          {label}
        </Text>
        <SuffixIcon fill={theme.colors.text} size={24} />
      </View>
    </Pressable>
  );
}
