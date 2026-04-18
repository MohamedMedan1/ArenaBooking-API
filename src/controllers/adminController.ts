import Admin from "../models/adminModel";
import { getUser, updateUser } from "./handlerFactory";

const getMe = getUser(Admin);
const updateMe = updateUser(Admin);

export { getMe, updateMe };
