import { Field } from "../models/fieldModel";
import {
  createNewDocument,
  deleteDocument,
  getAllDocuments,
  getDocument,
  updateDocument,
} from "./handlerFactory";
import { IField } from "../interfaces/IField";

const getAllFields = getAllDocuments<IField>(Field, "fields");
const createNewField = createNewDocument<IField>(Field, "fields");

const getField = getDocument<IField>(Field, "fields");
const updateField = updateDocument<IField>(Field, "fields");
const deleteField = deleteDocument<IField>(Field, "fields");

export { getAllFields, getField, createNewField, updateField, deleteField };
