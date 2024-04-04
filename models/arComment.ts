import { User } from "./user";

export class ArComment {
  _id?: string;
  content!: string;
  user!: string | User;
  createdAt: Date = new Date();

  latitude!: number;
  longitude!: number;
}
