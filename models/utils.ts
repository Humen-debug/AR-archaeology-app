export abstract class Model {
  _id: string;
}

export abstract class GeoLocation {
  latitude: number;
  longitude: number;
}

export interface Content {
  heading: string;
  desc?: string;
  images?: string[];
}
