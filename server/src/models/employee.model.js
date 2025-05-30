import mongoose from "mongoose";

const employeeSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  position: {
    type: String,
    required: true,
    trim: true
  },
  department: {
    type: String,
    required: true,
    trim: true
  },
  salary: {
    type: Number,
    required: true,
    min: 0
  },
  dateOfJoining: {
    type: Date,
    default: Date.now
  },
  experience: {
    type: Number,
    required: true,
    min: 0
  },
}
  , {
    timestamps: true
  });

export const Employee = mongoose.model("Employee", employeeSchema);