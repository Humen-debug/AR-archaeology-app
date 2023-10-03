export interface Artifact {
  _id: string;
  name: string;
  image?: string;
  desc?: string;
  location?: string;
  date?: Date | string;
  category?: string;
}
