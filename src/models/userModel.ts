import { Schema, model } from "mongoose";
import { IUser } from "../interfaces/IUser";
import validator from "validator";
import bcrypt from "bcrypt";

// "User" may be ("Client") or ("Admin")
const options = { discriminatorKey: "type", collection: "users" };

const userSchema = new Schema<IUser>(
  {
    name: {
      type: String,
      required: [true, "Please provide your name!"],
      minlength: [3, "Your name can be at least 3 characters!"],
      maxlength: [30, "Your name can be at most 30 characters!"],
    },
    email: {
      type: String,
      required: [true, "Please provide your email!"],
      unique: true,
      validate: {
        validator: (value: string) => validator.isEmail(value),
        message: "Please provide a valid email!",
      },
    },
    password: {
      type: String,
      required: [true, "Please provide your password!"],
      minLength: [8, "Password length should be at least 8 characters"],
      maxLength: [16, "Password length should be at most 16 characters"],
      validate: {
        validator: (value: string) =>
          validator.isStrongPassword(value, {
            minLength: 8,
            minLowercase: 1,
            minUppercase: 1,
            minNumbers: 1,
            minSymbols: 1,
          }),
        message: "Password must be strong enough",
      },
      select: false,
    },
    passwordConfirm: {
      type: String,
      required: [true, "Please confirm your password!"],
      validate: {
        validator: function (this: any, value: string) {
          return value === this.password;
        },
        message: "Your confirmed password must be equal to password",
      },
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  options,
);

// Pre Document Middleware to hash password before save it!
userSchema.pre<IUser>("save", async function () {
  if (!this.isModified("password")) return;

  this.password = await bcrypt.hash(this.password, 12);
  this.passwordConfirm = undefined;
});

// Instance Method for password correctness checking
userSchema.methods.isCorrectPassword = async function (this: IUser, candidatePassword: string): Promise<boolean> {
  return await bcrypt.compare(candidatePassword, this.password);
};

const User = model<IUser>("User", userSchema);

export default User;
