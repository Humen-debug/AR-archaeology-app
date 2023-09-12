export interface User {
  id: string;
  name: string;
  email: string;
  password: string; // add credential
}

export interface AuthState {
  token?: string | null;
  user?: User | null;
}
