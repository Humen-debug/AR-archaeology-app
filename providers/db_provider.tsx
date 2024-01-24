import { RealmProvider } from "@models";

export const AppWrapperNonSync: React.FC<{ children: JSX.Element | JSX.Element[] }> = ({ children }) => {
  return <RealmProvider>{children}</RealmProvider>;
};
