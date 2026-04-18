import Client from "../models/clientModel";
import { getUser, updateUser } from "./handlerFactory";

const getMe = getUser(Client);
const updateMe = updateUser(Client);

export { getMe, updateMe };
