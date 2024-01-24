import { LinearGradient } from "expo-linear-gradient";
import { StyleSheet, TouchableOpacityProps, View } from "react-native";
import { useAppTheme } from "@styles";
import { TouchableOpacity } from "react-native-gesture-handler";
import { GenericTouchableProps } from "react-native-gesture-handler/lib/typescript/components/touchables/GenericTouchable";
import * as Icons from "@components/icons";
import { SvgProps } from "react-native-svg";

export interface IconProps extends SvgProps {
  fill?: string;
}

interface IconBtnProps {
  size?: number;
  square?: boolean;
  iconProps?: IconProps;
  icon: string | ((props?: IconProps) => JSX.Element) | JSX.Element;
}
export default function IconBtn(props: IconBtnProps & GenericTouchableProps & TouchableOpacityProps) {
  const theme = useAppTheme();
  const _style = useStyle({ square: props.square });
  let IconComponent;
  if (typeof props.icon === "string") {
    var key = props.icon;
    if (!props.icon.endsWith("Icon")) key += "Icon";
    key = key[0].toUpperCase() + key.substring(1);
    IconComponent = Icons[key];
    if (!IconComponent) throw Error(`IconBtn does not support icon ${props.icon}.`);
  } else if (props.icon instanceof Object) {
    IconComponent = () => props.icon;
  } else {
    IconComponent = props.icon;
  }
  return (
    <TouchableOpacity {...props}>
      <View style={[_style.container, { width: props.size ?? 48, height: props.size ?? 48 }]}>
        <LinearGradient colors={theme.colors.gradientBlack} start={{ x: 0, y: 1 }} end={{ x: 1, y: 0 }} style={_style.gradient}>
          <IconComponent {...props.iconProps} />
        </LinearGradient>
      </View>
    </TouchableOpacity>
  );
}

const useStyle = ({ square }: any) =>
  StyleSheet.create({
    container: {
      position: "relative",
      borderRadius: square ? 8 : 100,
      overflow: "hidden",
    },
    gradient: {
      flex: 1,
      flexShrink: 0,
      display: "flex",
      alignContent: "center",
      justifyContent: "center",
      alignItems: "center",
      textAlign: "center",
    },
  });
