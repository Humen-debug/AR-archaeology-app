import Realm, { BSON } from "realm";

export class Tag extends Realm.Object<Tag> {
  _id: BSON.ObjectId = new BSON.ObjectId();
  name: string;
  createdAt: Date = new Date();

  static schema: Realm.ObjectSchema = {
    name: "Tag",
    properties: {
      _id: "objectId",
      name: { type: "string", indexed: true },
      createdAt: "date",
    },
    primaryKey: "_id",
  };
}
