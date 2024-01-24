import { AppProvider, UserProvider, useApp } from "@realm/react";
import { RealmProvider } from "@models";
import { OpenRealmBehaviorType, OpenRealmTimeOutBehavior, CompensatingWriteError } from "realm";
import Realm from "realm";
import { useEffect } from "react";

export const AppWrapperSync: React.FC<{ appId: string; children: JSX.Element | JSX.Element[] }> = ({ appId, children }) => {
  return (
    <AppProvider id={appId}>
      <UserProvider fallback={LogIn}>
        <RealmProvider
          sync={{
            flexible: true,
            onError: (_session, error) => {
              if (error instanceof CompensatingWriteError) {
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
                subs.add(realm.objects("Artifact"));
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

function LogIn() {
  const app = useApp();
  // uses anonymous authentication
  async function loginUser() {
    try {
      await app.logIn(Realm.Credentials.anonymous());
    } catch (error) {
      console.error("fail to login");
    }
  }
  useEffect(() => {
    loginUser();
  }, []);
  return <></>;
}
