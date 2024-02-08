import { Content, Model } from "./utils";

export interface GeoPoint extends Model {
  latitude: number;
  longitude: number;
}

export class Location extends Model {
  name!: string;
  desc?: string;
  latitude!: number;
  longitude!: number;
  images?: string[];
  order: number = 0;
  route: string;
  createdAt: Date = new Date();
}

export type DifficultyLevel = "Easy" | "Moderate" | "Difficult";
export class Route extends Model {
  name!: string;
  briefDesc?: string;
  desc?: string;
  content?: Content[];
  thumbnails?: string[];
  difficulty: DifficultyLevel = "Moderate";

  order: number = 0;
  createdAt: Date = new Date();
}
