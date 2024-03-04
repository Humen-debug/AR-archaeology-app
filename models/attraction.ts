import { Tag } from "./tag";
import { Content, Model } from "./utils";

export type Weekday = "Sunday" | "Monday" | "Tuesday" | "Wednesday" | "Thursday" | "Friday" | "Saturday";

export class OpenHour {
  openTime: string;
  closeTime: string;
  days: Weekday[];
}

export type AttractionType = "Attraction" | "Restaurant" | "Lodging" | "Other";

export class Attraction extends Model {
  name: string;
  briefDesc?: string;
  desc?: string;
  content?: Content[];
  thumbnails?: string[];
  contact?: string;
  // string for _id, Tag for entire object fetched by using "$populate"
  tags?: (string | Tag)[];
  entranceFee: number;

  order: number;

  latitude?: number;
  longitude?: number;

  businessHours?: OpenHour[];
  type: AttractionType;

  createdAt: Date;
}
