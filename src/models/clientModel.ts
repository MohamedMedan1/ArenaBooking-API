import { Schema } from "mongoose";
import User from "./userModel";
import { IUser } from "../interfaces/IUser";

const clientSchema = new Schema<IUser>({});
const Client = User.discriminator<IUser>("Client", clientSchema);

export default Client;
