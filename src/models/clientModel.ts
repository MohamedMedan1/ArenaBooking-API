import { Schema } from "mongoose";
import User from "./userModel";
import { IClient } from "../interfaces/IClient";
import { Email } from "../utils/email";

const clientSchema = new Schema<IClient>({
  phone: {
    type: String,
    required: [true, "Please provide your phone number"],
    unique: true,
    minlength: [11, "Phone number must be 11 characters"],
    maxlength: [11, "Phone number must be 11 characters"],
  },
});
const Client = User.discriminator<IClient>("Client", clientSchema);
export default Client;
