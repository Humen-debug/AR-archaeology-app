import { Tag } from "./tag";

export class File {
  object!: string;
  material?: string;
  texture?: string;
}

export class Artifact {
  _id: string;
  name!: string;
  image?: string;
  desc?: string;
  location?: string;
  date?: string;
  tags?: string;
  createdAt: Date = new Date();
  file?: File;

  latitude?: number;
  longitude?: number;

  width?: number;
  height?: number;
  length?: number;
}
