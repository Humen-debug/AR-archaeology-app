import { View } from "react-native";
import { ActivityIndicator } from "react-native-paper";

export default function LoadingPage() {
  return (
    <View style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, justifyContent: "center", alignItems: "center" }}>
      <ActivityIndicator size="large" animating={true} />
    </View>
  );
}
