import { View, StyleSheet, useWindowDimensions } from "react-native";
import { AppTheme, useAppTheme } from "@providers/style_provider";
import { TouchableOpacity } from "react-native-gesture-handler";
import { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import { TouchableRipple } from "react-native-paper";

export default function NavBar({ state, descriptors, navigation, insets }: BottomTabBarProps) {
  const { theme } = useAppTheme();
  const { width: screenWidth } = useWindowDimensions();
  const style = useStyle(theme, screenWidth / state.routes.length);

  return (
    <View style={style.container}>
      <View style={style.bar}>
        {state.routes.map((route: any, index: number) => {
          const { options } = descriptors[route.key];

          const icon = options.tabBarIcon;
          const label = options.tabBarLabel || options.title || route.name;
          const isActive = state.index === index;

          const onPress = () => {
            const event = navigation.emit({
              type: "tabPress",
              target: route.key,
              canPreventDefault: true,
            });

            if (!isActive && !event.defaultPrevented) {
              navigation.navigate(route.name);
            }
          };

          const onLongPress = () => {
            navigation.emit({
              type: "tabLongPress",
              target: route.key,
            });
          };
          const color = isActive ? theme.colors.primary : theme.colors.grey1;
          return (
            <TouchableRipple
              accessibilityRole="button"
              accessibilityState={isActive ? { selected: true } : {}}
              accessibilityLabel={options.tabBarAccessibilityLabel}
              testID={options.tabBarTestID}
              onPress={onPress}
              onLongPress={onLongPress}
              key={index}
              style={style.barItem}
            >
              {icon && typeof icon === "function" ? icon({ color: color, size: 32, focused: isActive }) : icon}
            </TouchableRipple>
          );
        })}
      </View>
    </View>
  );
}

const useStyle = (theme: AppTheme, barWidth: number) =>
  StyleSheet.create({
    container: {
      position: "absolute",
      bottom: 0,
      left: 0,
      right: 0,
      overflow: "visible",
      backgroundColor: "transparent",
    },
    bar: {
      height: 64,
      width: "100%",
      position: "relative",
      display: "flex",
      flexDirection: "row",
      backgroundColor: theme.colors.background,
    },
    barItem: {
      height: "100%",
      minWidth: barWidth,
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
    },
    barTab: {
      height: "100%",
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: theme.colors.primary,
    },
  });
