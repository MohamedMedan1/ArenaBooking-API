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

clientSchema.pre<IClient>("save", function () {
  if (this.isModified("email") && !this.isNew) {
    (this as any).oldEmail = this.email;
  }
});

clientSchema.post<IClient>("save", async function (doc, next) {
  const oldEmail = (this as any)._oldEmail;

  if (oldEmail && oldEmail !== doc.email) {
    try {
      const firstName = doc!.name.split(" ")[0];
      await new Email({
        email: doc!.email,
        name: firstName!,
      }).sendEmailUpdateNotification({
        firstName,
        oldEmail,
        newEmail: doc.email,
      });
    } catch (err) {
      console.error("Email error: ", err);
    }
  }

  next();
});

const Client = User.discriminator<IClient>("Client", clientSchema);
export default Client;
