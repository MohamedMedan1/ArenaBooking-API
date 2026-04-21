import { Field } from "../models/fieldModel";
import {
  createNewDocument,
  deleteDocument,
  getAllDocuments,
  getDocument,
  updateDocument,
} from "./handlerFactory";
import { IField } from "../interfaces/IField";

const getAllFields = getAllDocuments<IField>(Field);
const createNewField = createNewDocument<IField>(Field);

const getField = getDocument<IField>(Field);
const updateField = updateDocument<IField>(Field);
const deleteField = deleteDocument<IField>(Field);

export { getAllFields, getField, createNewField, updateField, deleteField };
