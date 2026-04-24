import { NextFunction, Request, Response } from "express";
import { AppError } from "../utils/appError";
import catchAsync from "../utils/catchAsync";
import {
  createNewDocument,
  deleteDocument,
  getAllDocuments,
  getDocument,
  updateDocument,
} from "./handlerFactory";
import { IField } from "../interfaces/IField";
import { Field } from "../models/fieldModel";


const getAllFields = getAllDocuments<IField>(Field,"fields");
const createNewField = createNewDocument<IField>(Field,"fields");

const getField = getDocument<IField>(Field,"fields");
const updateField = updateDocument<IField>(Field,"fields");
const deleteField = deleteDocument<IField>(Field,"fields");

const toggleFieldActivation = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;

    const field = await Field.findById(id);

    if (!field) return next(new AppError("There no field with that Id", 404));

    field.isActive = !field.isActive;
    await field.save();

    res.status(200).json({
      status: "success",
      message: `Field is now ${field.isActive ? "active" : "inactive"}`,
      data:field,
    })
  },
);

export { getAllFields, getField, createNewField, updateField, deleteField,toggleFieldActivation };
