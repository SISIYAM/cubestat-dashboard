import mongoose from "mongoose";

// Flexible schema that accepts any structure from the database
const EpsSchema = new mongoose.Schema(
  {},
  {
    timestamps: false,
    collection: "sensor_readings",
    strict: false, // Allow any fields from the database
  }
);

// Prevent model overwrite error in development
export default mongoose.models.SensorReading ||
  mongoose.model("SensorReading", EpsSchema);
