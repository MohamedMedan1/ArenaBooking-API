import { Schema, model } from "mongoose";
import { IField } from "../interfaces/IField";

const fieldSchema = new Schema<IField>({
  image: {
    type: String,
    required: [true, "Please provide field image"],
  },
  name: {
    type: String,
    trim: true,
    unique: true,
    required: [true, "Please provide field name"],
    minlength: [1, "Field name should be at least 1 character!"],
    maxlength: [20, "Field name should be at most 20 characters!"],
  },
  capacity: {
    type: Number,
    required: [true, "Please provide field capacity"],
    min: [2, "Field capacity should be at least 2 players!"],
    max: [22, "Field capacity should be at most 22 players!"],
  },
  pricePerHour: {
    type: Number,
    required: [true, "Please provide field price per hour"],
    min: [100, "Field price should be equal or more than 100 !"],
  },
  category: {
    type: Schema.Types.ObjectId,
    ref: "Category",
    required: [true, "Please provide category Id !"],
  },
  rating: {
    type: Number,
    default: 0,
    min: [0, "Field rating should be at least 0!"],
    max: [5, "Field rating should be at most 5 !"],
  },
  timeSlots: [
    {
      date: {
        type: Date,
        default: Date.now,
      },
      times: [
        {
          startTime: String,
          endTime: String,
          duaration: {
            type: Number,
            default: 2,
          },
          isBooked: {
            type: Boolean,
            default: false,
          },
          atNight: {
            type: Boolean,
            default: false,
          },
          nightCost: {
            type: Number,
            default: 0,
          },
        },
      ],
    },
  ],
  imagePublicId: {
    type: String,
    required: [true, "Please provide category image public ID!"],
  },
},{ timestamps: true });

const Field = model<IField>("Field", fieldSchema);
export { Field };
