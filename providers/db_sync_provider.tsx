import { AppProvider, UserProvider, useApp, Realm, createRealmContext, RealmProvider } from "@realm/react";
import { AppUser, Artifact, Tag, File, Location } from "@models";
import { OpenRealmBehaviorType, OpenRealmTimeOutBehavior, CompensatingWriteError } from "realm";
import { useEffect } from "react";

const schemas = [Artifact, File, Tag, Location, AppUser];
const behaviorConfiguration = {
  type: OpenRealmBehaviorType.DownloadBeforeOpen,
  timeOut: 30 * 1000,
  timeOutBehavior: OpenRealmTimeOutBehavior.OpenLocalRealm,
};

export const AppWrapperSync: React.FC<{ appId: string; children: JSX.Element | JSX.Element[] }> = ({ appId, children }) => {
  return (
    <AppProvider id={appId}>
      <UserProvider fallback={LoginAnonymous}>
        <RealmProvider
          schema={schemas}
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
            newRealmFileBehavior: behaviorConfiguration,
            existingRealmFileBehavior: behaviorConfiguration,
            initialSubscriptions: {
              update: (subs, realm) => {
                console.log(`init subscriptions`);
                subs.add(realm.objects(Artifact));
                subs.add(realm.objects(Tag));
                subs.add(realm.objects(Location));
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
