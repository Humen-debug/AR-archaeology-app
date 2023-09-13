import { Text } from "react-native-paper";
import { useAppTheme } from "../../styles";
import MainBody from "../../components/main_body";
import IconBtn from "../../components/icon_btn";
import BackBtn from "../../assets/icons/chevron-left.svg";
import { useRouter } from "expo-router";
import { StyleSheet, View } from "react-native";

export default function Explore() {
  const theme = useAppTheme();
  const router = useRouter();

  return (
    <MainBody>
      <>
        <View style={_style.tabBar}>
          <IconBtn
            size={44}
            icon={<BackBtn fill="white" />}
            onPress={() => {
              router.replace("/home");
            }}
          />
        </View>
      </>
    </MainBody>
  );
}

const _style = StyleSheet.create({
  tabBar: {
    position: "absolute",
    left: 20,
    flexDirection: "row",
    flexShrink: 0,
    alignContent: "center",
    justifyContent: "flex-start",
  },
});
