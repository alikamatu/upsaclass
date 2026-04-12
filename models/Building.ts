import mongoose from "mongoose";

const BuildingSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    code: {
      type: String,
      required: true,
      unique: true,
    },
    address: {
      type: String,
    },
  },
  { timestamps: true }
);

export default mongoose.models.Building || mongoose.model("Building", BuildingSchema);
