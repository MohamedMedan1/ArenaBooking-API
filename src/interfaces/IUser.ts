import { Document } from "mongoose";

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  passwordConfirm?: string | undefined;
  createdAt: Date;
  isCorrectPassword: (
    candidatePassword: string) => Promise<boolean>;
}
