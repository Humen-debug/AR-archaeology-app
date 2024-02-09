import { useAppTheme, AppTheme } from "@/providers/style_provider";
import { StyleSheet, View } from "react-native";
import { TouchableHighlight } from "react-native-gesture-handler";
import { Text } from "react-native-paper";

export interface Props {
  inputValue: number;
  onChange: (value: number) => void;
  max?: number;
  min?: number;
  maxWidth?: number;
}

export default function NumInput({ inputValue, onChange, max, min, maxWidth = 164 }: Props) {
  const { theme } = useAppTheme();
  const style = useStyle({ theme });

  const canDecrease = min === undefined || inputValue > min;
  const canIncrease = max === undefined || inputValue < max;

  function increase() {
    if (canIncrease) onChange(inputValue + 1);
  }
  function decrease() {
    if (canDecrease) onChange(inputValue - 1);
  }
  return (
    <View style={[style.numInput, { width: maxWidth, maxWidth: maxWidth }]}>
      <TouchableHighlight style={[style.button, { backgroundColor: canDecrease ? theme.colors.primary : theme.colors.grey3 }]} onPress={decrease}>
        <View>
          <Text variant="headlineSmall" style={{ color: theme.colors.textOnPrimary }}>
            -
          </Text>
        </View>
      </TouchableHighlight>
      <View style={style.input}>
        <Text variant="labelSmall" style={{ textAlign: "center" }}>
          {inputValue}
        </Text>
      </View>
      <TouchableHighlight style={[style.button, { backgroundColor: canIncrease ? theme.colors.primary : theme.colors.grey3 }]} onPress={increase}>
        <View>
          <Text variant="headlineSmall" style={{ color: theme.colors.textOnPrimary }}>
            +
          </Text>
        </View>
      </TouchableHighlight>
    </View>
  );
}

const useStyle = ({ theme }: { theme: AppTheme }) =>
  StyleSheet.create({
    numInput: {
      flexDirection: "row",
      flex: 1,
    },
    button: {
      borderRadius: theme.borderRadius.xs,
      width: 36,
      height: 36,

      flexDirection: "row",
      justifyContent: "center",
      alignContent: "center",
      overflow: "hidden",
    },
    input: {
      flex: 1,
      textAlign: "center",
      justifyContent: "center",
      alignContent: "center",
    },
  });
