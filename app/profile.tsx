import { AppBar, MainBody } from "@/components";
import { useAuth } from "@/providers/auth_provider";
import { Text } from "react-native-paper";

export default function ProfilePage() {
  const { state: authState } = useAuth();
  const user = authState.user;

  return (
    <MainBody padding={{ top: 0 }}>
      <AppBar title="Profile" showBack={true} />
      <Text>{user?.name}</Text>
      <Text>{user?.email}</Text>
    </MainBody>
  );
}
