import Realm, { BSON } from "realm";

export class Location extends Realm.Object<Location> {
  _id: BSON.ObjectId = new BSON.ObjectID();
  name!: string;
  desc?: string;
  latitude!: number;
  longitude!: number;
  images?: Realm.List<string>;
  order: number;

  createdAt: Date = new Date();

  static schema: Realm.ObjectSchema = {
    name: "Location",
    properties: {
      _id: { type: "objectId", default: () => new BSON.ObjectId() },
      name: { type: "string", indexed: true },
      desc: "string?",
      latitude: { type: "decimal128" },
      longitude: { type: "decimal128" },
      images: { type: "list", objectType: "string", default: [] },
      order: { type: "int", default: 0 },
      createdAt: { type: "date", default: () => new Date() },
    },
    primaryKey: "_id",
  };
}
