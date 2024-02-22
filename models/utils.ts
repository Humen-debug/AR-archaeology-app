export abstract class Model {
  _id: string;
}

export interface Content {
  heading: string;
  desc?: string;
  images?: string[];
}
