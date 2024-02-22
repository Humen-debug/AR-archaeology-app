export class User {
  _id?: string;
  firstName?: string;
  lastName?: string;
  username?: string;
  email?: string;
  password?: string;
  phone?: string;
  dob?: Date;

  createdAt: Date = new Date();

  bookmarks?: string[];
  collections?: string[];
}
