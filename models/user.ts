export class User {
  _id?: string;
  name?: string;
  email?: string;
  createdAt?: Date = new Date();
  bookmarks?: string[];
  collections?: string[];
}
