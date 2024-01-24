import { View, StyleSheet } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useAppTheme } from "@styles";
import { Text } from "react-native-paper";
import { TouchableOpacity } from "react-native-gesture-handler";
import { ExploreIcon } from "@/components/icons";
import { BottomTabBarProps } from "@react-navigation/bottom-tabs";

type FabProps = {
  onPress: () => void;
};

function Fab(props: FabProps): JSX.Element {
  const theme = useAppTheme();
  return (
    <View style={[_style.fab, { backgroundColor: theme.colors.highlight2.concat("80") }, _style.lightEffect]}>
      <ExploreIcon style={_style.iconShadow} fill="white" height={80} width={80} />
    </View>
  );
}

export default function NavBar({ state, descriptors, navigation, insets }: BottomTabBarProps) {
  const theme = useAppTheme();

  const onExplorePress = () => {};
  return (
    <View style={_style.container}>
      <View style={{ position: "relative", height: "100%", width: "100%", overflow: "visible" }}>
        <View style={_style.bar}>
          <LinearGradient
            style={{ ..._style.gradient, paddingTop: 12, paddingHorizontal: 64 }}
            colors={["#2B2E2B", "#2A2E2B", "#3A3D3B"]}
            start={{ x: 1, y: 0 }}
            end={{ x: 0, y: 1 }}
          >
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
              const color = isActive ? theme.colors.highlight : theme.colors.grey1;
              return (
                <TouchableOpacity
                  accessibilityRole="button"
                  accessibilityState={isActive ? { selected: true } : {}}
                  accessibilityLabel={options.tabBarAccessibilityLabel}
                  testID={options.tabBarTestID}
                  onPress={onPress}
                  onLongPress={onLongPress}
                  key={index}
                >
                  {
                    <View style={_style.barTab}>
                      {icon && typeof icon === "function" ? icon({ color: color, size: 24, focused: isActive }) : icon}
                      <Text style={{ color: color }}>{label}</Text>
                    </View>
                  }
                </TouchableOpacity>
              );
            })}
          </LinearGradient>
        </View>
        {/* <Fab onPress={onExplorePress} /> */}
      </View>
    </View>
  );
}

const _style = StyleSheet.create({
  container: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    overflow: "visible",
    backgroundColor: "transparent",
  },
  bar: {
    height: 86,
    borderTopLeftRadius: 40,
    borderTopRightRadius: 40,
    flexDirection: "row",
    flexShrink: 0,
    overflow: "hidden",
    backgroundColor: "transparent",
  },
  gradient: {
    width: "100%",
    height: "100%",
    flexDirection: "row",
    flexShrink: 0,
    justifyContent: "space-between",
    alignContent: "center",
  },
  barTab: {
    height: 60,
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    alignContent: "center",
    textAlign: "center",
  },
  fab: {
    position: "absolute",
    bottom: 32.5,
    height: 80,
    width: 80,
    borderRadius: 40,
    alignSelf: "center",
  },
  lightEffect: {
    shadowColor: "#DBF43E",
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
  },
  iconShadow: {
    shadowColor: "black",
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
  },
});
