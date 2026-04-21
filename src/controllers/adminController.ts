import Admin from "../models/adminModel";
import {
  createNewDocument,
  deleteDocument,
  getAllDocuments,
  getUser,
  updateUser,
} from "./handlerFactory";
import { IAdmin } from "../interfaces/IAdmin";

const getAllAssistants = getAllDocuments<IAdmin>(Admin,"admins");
const createNewAssistant = createNewDocument<IAdmin>(Admin,"admins");
const deleteAssistant = deleteDocument<IAdmin>(Admin,"admins");

const getMe = getUser(Admin);
const updateMe = updateUser(Admin);

export {
  getAllAssistants,
  createNewAssistant,
  deleteAssistant,
  getMe,
  updateMe,
};
