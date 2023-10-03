// configure monogdb Realm schemas
import { createRealmContext } from "@realm/react";
import { Artifact, File } from "./artifact";
import { Realm } from "@realm/react";

export const schemas = [Artifact, File];

export const realmConfig: Realm.Configuration = {
  schema: schemas,
  path: "XR-OpenArchaeology",
};

export const { RealmProvider, useRealm, useObject, useQuery } = createRealmContext(realmConfig);
