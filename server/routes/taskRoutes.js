import express from "express";
import {protect} from "../middleware/authMiddleware.js";
import {getTasks,addTask,editTask,removeTask} from "../controllers/taskController.js";


const router=express.Router();

router.use(protect);
router.get("/",getTasks);
router.post("/",addTask);
router.patch("/:id",editTask);
router.delete("/:id",removeTask);

export default router;