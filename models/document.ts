import { Content, Model } from "./utils";

export class Document extends Model {
  name: string;
  content: Content[];
  order: number;
  createdAt: Date;
}
