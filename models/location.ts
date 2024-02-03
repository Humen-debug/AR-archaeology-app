export class Location {
  _id: string;
  name!: string;
  desc?: string;
  latitude!: number;
  longitude!: number;
  images?: string[];
  order: number = 0;

  createdAt: Date = new Date();
}
