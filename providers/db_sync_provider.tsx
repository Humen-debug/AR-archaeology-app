import { AppProvider, UserProvider, useApp } from "@realm/react";
import { RealmProvider } from "../models";
import { OpenRealmBehaviorType, OpenRealmTimeOutBehavior } from "realm";
import { Redirect } from "expo-router";
import { useEffect } from "react";

export const AppWrapperSync: React.FC<{ appId: string; children: JSX.Element | JSX.Element[] }> = ({ appId, children }) => {
  return (
    <AppProvider id={appId}>
      <UserProvider fallback={LogIn}>
        <RealmProvider
          sync={{
            flexible: true,
            onError: console.error,
            existingRealmFileBehavior: {
              type: OpenRealmBehaviorType.DownloadBeforeOpen,
              timeOut: 1000,
              timeOutBehavior: OpenRealmTimeOutBehavior.OpenLocalRealm ?? "openLocalRealm",
            },
          }}
        >
          {children}
        </RealmProvider>
      </UserProvider>
    </AppProvider>
  );
};

function LogIn() {
  const app = useApp();

  // uses anonymous authentication
  async function loginUser() {
    await app.logIn(Realm.Credentials.anonymous());
  }
  useEffect(() => {
    loginUser();
  }, []);
  return <Redirect href={"/home"} />;
}
