import { useAuth } from "../../providers/auth_provider";
import { Button } from "react-native-paper";
import { useAppTheme } from "../../styles";
import MainBody from "../../components/main_body";

export default function LoginPage() {
  const theme = useAppTheme();
  const { setAuthState } = useAuth();
  const login = () => {
    setAuthState({});
  };

  return (
    <MainBody>
      <Button onPress={login} buttonColor="theme.colors.background">
        Login
      </Button>
    </MainBody>
  );
}
