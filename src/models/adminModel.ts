import { Schema } from "mongoose";
import User from "./userModel";
import { IAdmin } from "../interfaces/IAdmin";

const adminSchema = new Schema<IAdmin>({
  role: {
    type: String,
    default: "assistant",
    enum: {
      values: ["manager", "assistant"],
      message: "Role can only be manager or assistant",
    },
  },
  gender: {
    type: String,
    default: "male",
    enum: {
      values: ["male", "female"],
      message: "Gender can only be male or female",
    },
  },
  age: {
    type: Number,
    required: [true, "Please provide your age!"],
    min: [18, "Your age must be equal or older than 18"],
  },
});

const Admin = User.discriminator<IAdmin>("Admin", adminSchema);

export default Admin;