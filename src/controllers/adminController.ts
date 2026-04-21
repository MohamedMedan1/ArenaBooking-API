import Admin from "../models/adminModel";
import {
  createNewDocument,
  deleteDocument,
  getAllDocuments,
  getUser,
  updateUser,
} from "./handlerFactory";
import { IAdmin } from "../interfaces/IAdmin";

const getAllAssistants = getAllDocuments<IAdmin>(Admin);
const createNewAssistant = createNewDocument<IAdmin>(Admin);
const deleteAssistant = deleteDocument<IAdmin>(Admin);

const getMe = getUser(Admin);
const updateMe = updateUser(Admin);

export {
  getAllAssistants,
  createNewAssistant,
  deleteAssistant,
  getMe,
  updateMe,
};
