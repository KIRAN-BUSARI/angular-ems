import { Employee } from "../models/employee.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const createEmployee = asyncHandler(async (req, res) => {
  const { name, position, department, salary, dateOfJoining, experience } = req.body;

  console.log("Creating employee with data:", req.body);

  if (!name || !position || !department || !salary || !dateOfJoining || !experience) {
    throw new ApiError(
      400,
      "All fields are required",
    );
  }
  const newEmployee = await Employee.create({
    name,
    position,
    department,
    salary,
    dateOfJoining,
    experience
  });
  return res.status(201).json(new ApiResponse(
    201,
    newEmployee,
    "Employee created successfully"
  ));
});

const getAllEmployee = asyncHandler(async (req, res) => {
  const employees = await Employee.find({});
  return res.status(200).json(new ApiResponse(
    200,
    employees,
    "Employees retrieved successfully"
  ));
});

const deleteEmployee = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!id) {
    throw new ApiError(
      400,
      "Employee ID is required",
    );
  }

  const employee = await Employee.findByIdAndDelete(id);

  if (!employee) {
    throw new ApiError(
      404,
      "Employee not found",
    );
  }

  return res.status(200).json(new ApiResponse(
    200,
    null,
    "Employee deleted successfully"
  ));
});

const updateEmployee = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { name, position, department, salary, dateOfJoining, experience } = req.body;

  if (!name || !position || !department || !salary || !dateOfJoining || !experience) {
    throw new ApiError(
      400,
      "All fields are required",
    );
  }

  if (!id) {
    throw new ApiError(
      400,
      "Employee ID is required",
    );
  }

  const updatedEmployee = await Employee.findByIdAndUpdate(id, {
    name,
    position,
    department,
    salary,
    dateOfJoining,
    experience
  }, { new: true });

  if (!updatedEmployee) {
    throw new ApiError(
      404,
      "Employee not found",
    );
  }

  return res.status(200).json(new ApiResponse(
    200,
    updatedEmployee,
    "Employee updated successfully"
  ));
});

export { createEmployee, getAllEmployee, deleteEmployee, updateEmployee };