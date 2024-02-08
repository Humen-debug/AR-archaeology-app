import { Model } from "./utils";

export class File {
  object!: string;
  material?: string;
  texture?: string;
}

export class Artifact extends Model {
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
