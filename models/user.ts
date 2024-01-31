import Realm, { BSON, User } from "realm";
import { Artifact } from "./artifact";

export class AppUser extends Realm.Object<AppUser> {
  _id: BSON.ObjectId = new BSON.ObjectId();
  createdAt: Date = new Date();
  bookmarks?: Realm.List<Artifact>;
  collections?: Realm.List<Artifact>;

  static schema: Realm.ObjectSchema = {
    name: "AppUser",
    properties: {
      _id: { type: "objectId", default: () => new BSON.ObjectId() },
      createdAt: { type: "date", default: () => new Date() },
      bookmarks: { type: "list", objectType: "Artifact", default: [] },
      collections: { type: "list", objectType: "Artifact", default: [] },
    },
    primaryKey: "_id",
  };
}
