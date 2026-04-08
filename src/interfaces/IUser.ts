import { Document } from "mongoose";

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  passwordConfirm?: string | undefined;
  createdAt: Date;
  passwordChangedAt?: Date;
  type?: string;
  isCorrectPassword: (candidatePassword: string) => Promise<boolean>;
  isPasswordChangedAfterLogin: (jwtTimeStamp: number) => boolean;
}
