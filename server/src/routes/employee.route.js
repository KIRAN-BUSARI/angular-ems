import { Router } from "express";

const router = Router();
import { getAllEmployee, createEmployee, updateEmployee, deleteEmployee } from "../controllers/employee.controller.js";

router.route("/").get(getAllEmployee);
router.route("/create").post(createEmployee);
router.route("/:id").put(updateEmployee);
router.route("/:id").delete(deleteEmployee);

export default router;