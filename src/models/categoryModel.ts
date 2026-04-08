import { model, Schema } from "mongoose";
import { ICategory } from "../interfaces/ICategory";

const categorySchema = new Schema<ICategory>({
  name: {
    type: String,
    required: [true, "Please provide category name!"],
    unique: true,
    minlength: [3, "Category name should be at least 3 characters!"],
    maxlength: [20, "Category name should be at most 20 characters!"],
  },
  image: {
    type: String,
    required: [true, "Please provide category image!"],
  },
  imagePublicId: {
    type: String,
    required: [true, "Please provide category image public ID!"],
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Category = model<ICategory>("Category", categorySchema);

export default Category;
