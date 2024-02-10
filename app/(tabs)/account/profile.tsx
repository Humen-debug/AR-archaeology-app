import { AppBar, MainBody } from "@components";
import { useAuth } from "@providers/auth_provider";
import { Text } from "react-native-paper";

export default function Page() {
  const { user } = useAuth();

  return (
    <MainBody padding={{ top: 0 }}>
      <AppBar title="Profile" showBack={true} />
    </MainBody>
  );
}
