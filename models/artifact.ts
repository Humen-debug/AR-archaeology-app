import Realm, { BSON } from "realm";
import { Tag } from "./tag";

export class File extends Realm.Object<File> {
  object!: string;
  material?: string;
  texture?: string;
  static schema = {
    name: "File",
    embedded: true,
    properties: {
      object: "string",
      material: "string?",
      texture: "string?",
    },
  };
}

export class Artifact extends Realm.Object<Artifact> {
  _id: BSON.ObjectId = new BSON.ObjectId();
  name!: string;
  image?: string;
  desc?: string;
  location?: string;
  date?: string;
  tags?: Realm.List<Tag>;
  createdAt: Date = new Date();
  file?: File;

  latitude?: number;
  longitude?: number;

  width?: number;
  height?: number;
  length?: number;

  static schema: Realm.ObjectSchema = {
    name: "Artifact",
    properties: {
      _id: { type: "objectId", default: () => new BSON.ObjectId() },
      name: { type: "string", indexed: true },
      image: "string?",
      desc: "string?",
      location: "string?",
      date: "string?",
      tags: { type: "list", objectType: "Tag", default: [] },
      createdAt: { type: "date", default: () => new Date() },
      file: "File?",
      latitude: { type: "decimal128", optional: true },
      longitude: { type: "decimal128", optional: true },
      width: { type: "decimal128", optional: true },
      height: { type: "decimal128", optional: true },
      length: { type: "decimal128", optional: true },
    },
    primaryKey: "_id",
  };
}
