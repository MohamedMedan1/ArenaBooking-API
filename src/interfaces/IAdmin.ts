import { IUser } from "./IUser";

export interface IAdmin extends IUser {
  role: string;
  gender: string;
  age: number;
}
