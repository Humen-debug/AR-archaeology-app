import { Realm } from "@realm/react";

export class Tag extends Realm.Object<Tag> {
  _id: Realm.BSON.ObjectId = new Realm.BSON.ObjectID();
  name!: string;
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
