import { Artifact } from "./artifact";

export class User {
  _id: string;
  name?: String;
  email?: String;
  createdAt: Date = new Date();
  bookmarks?: string[];
  collections?: string[];
  providers?: string[];
}
