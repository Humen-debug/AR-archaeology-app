// configure monogdb Realm schemas
import { createRealmContext } from "@realm/react";
import { Artifact, File } from "./artifact";
import { Realm } from "@realm/react";
import { Tag } from "./tag";
import { AppUser } from "./user";
import { Location } from "./location";

export const schemas = [Artifact, File, Tag, Location, AppUser];

export const realmConfig: Realm.Configuration = {
  schema: schemas,
  path: "XR-OpenArchaeology",
};

export const { RealmProvider, useRealm, useObject, useQuery } = createRealmContext(realmConfig);
