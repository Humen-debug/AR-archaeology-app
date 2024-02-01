import Realm, { BSON, User } from "realm";
import { Artifact } from "./artifact";

export class AppUser extends Realm.Object<AppUser> {
  _id: BSON.ObjectId = new BSON.ObjectId();
  userId: BSON.ObjectId;
  name: String;
  email?: String;
  createdAt: Date = new Date();
  bookmarks?: Realm.List<Artifact>;
  collections?: Realm.List<Artifact>;
  providers?: Realm.List<String>;

  static schema: Realm.ObjectSchema = {
    name: "AppUser",
    properties: {
      _id: { type: "objectId", default: () => new BSON.ObjectId() },
      userId: { type: "objectId" },
      name: { type: "string" },
      email: { type: "string", optional: true },
      createdAt: { type: "date", default: () => new Date() },
      bookmarks: { type: "list", objectType: "Artifact", default: [] },
      collections: { type: "list", objectType: "Artifact", default: [] },
      providers: { type: "list", objectType: "string", default: [] },
    },
    primaryKey: "_id",
  };
}
