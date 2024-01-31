import { AppProvider, UserProvider, useApp } from "@realm/react";
import { RealmProvider, useRealm } from "@models";
import { OpenRealmBehaviorType, OpenRealmTimeOutBehavior, CompensatingWriteError } from "realm";
import Realm from "realm";
import { useEffect } from "react";
import { router, useRootNavigation } from "expo-router";

export const AppWrapperSync: React.FC<{ appId: string; children: JSX.Element | JSX.Element[] }> = ({ appId, children }) => {
  return (
    <AppProvider id={appId}>
      <UserProvider fallback={LoginAnonymous}>
        <RealmProvider
          sync={{
            flexible: true,
            onError: (_session, error) => {
              if (error instanceof CompensatingWriteError) {
                console.log("Realm Provider error");
                console.debug({
                  code: error.code,
                  name: error.name,
                  category: error.category,
                  message: error.message,
                  url: error.logUrl,
                  writes: error.writes,
                });
              } else {
                console.error(error);
              }
            },
            existingRealmFileBehavior: {
              type: OpenRealmBehaviorType.DownloadBeforeOpen,
              timeOut: 30 * 1000,
              timeOutBehavior: OpenRealmTimeOutBehavior.OpenLocalRealm ?? "openLocalRealm",
            },
            initialSubscriptions: {
              update: (subs, realm) => {
                // subs.add(realm.objects("Artifact"));
                // subs.add(realm.objects("Tag"));
                // subs.add(realm.objects("Location"));
              },
              rerunOnOpen: true,
            },
          }}
        >
          {children}
        </RealmProvider>
      </UserProvider>
    </AppProvider>
  );
};

function LoginAnonymous() {
  const app = useApp();
  // uses anonymous authentication
  async function loginUser() {
    try {
      await app.logIn(Realm.Credentials.anonymous());
      console.log(`app current user: ${app.currentUser}`);
    } catch (error) {
      console.error("fail to login");
    }
  }
  useEffect(() => {
    loginUser();
  }, []);
  return <></>;
}

function Login() {
  const rootNav = useRootNavigation();

  useEffect(() => {
    if (!rootNav?.isReady) return;
    router.replace("/login");
  }, []);
  return <></>;
}
