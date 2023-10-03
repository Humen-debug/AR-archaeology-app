import Realm, { BSON } from "realm";

export class File extends Realm.Object<File> {
  obj: string;
  mtl?: string;
  texture?: string;
  static schema = {
    name: "File",
    embedded: true,
    properties: {
      obj: "string",
      mtl: "string?",
      texture: "string?",
    },
  };
}

export class Artifact extends Realm.Object<Artifact> {
  _id: BSON.ObjectId = new BSON.ObjectID();
  name!: string;
  image?: string;
  desc?: string;
  location?: string;
  date?: Realm.Mixed;
  category?: string;
  createAt: Date = new Date();
  file?: File;

  static schema = {
    name: "Artifact",
    properties: {
      _id: "objectId",
      name: "string",
      image: "string?",
      desc: "string?",
      location: "string?",
      date: "mixed?",
      category: "string?",
      createAt: "date",
      file: "File?",
    },
    primaryKey: "_id",
  };
}
