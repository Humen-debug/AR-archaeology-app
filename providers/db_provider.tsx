import { AppUser, Artifact, File, Location, Tag } from "@/models";
import { createRealmContext } from "@realm/react";

const { RealmProvider } = createRealmContext({ schema: [Artifact, File, Tag, Location, AppUser] });

export const AppWrapperNonSync: React.FC<{ children: JSX.Element | JSX.Element[] }> = ({ children }) => {
  return <RealmProvider>{children}</RealmProvider>;
};
