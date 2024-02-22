import { Attraction } from "./attraction";
import { Model } from "./utils";

export class Event extends Model {
  name: string;
  briefDesc?: string;
  content?: string;
  images?: string[];

  venue?: string | Attraction;
  startDate: Date;
  endDate: Date;

  order: number;
  createdAt: Date;
}
