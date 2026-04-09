import mongoose from "mongoose";

const LectureHallSchema = new mongoose.Schema(
  {
    hallCode: {
      type: String,
      required: true,
      unique: true,
    },
    name: {
      type: String,
      required: true,
    },
    capacity: {
      type: Number,
      required: true,
    },
    building: {
      type: String,
      required: true,
    },
    features: [
      {
        type: String,
      },
    ],
  },
  { timestamps: true }
);

export default mongoose.models.LectureHall ||
  mongoose.model("LectureHall", LectureHallSchema);
