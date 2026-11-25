import express from "express";
import {protect} from "../middleware/authMiddleware.js";
import upload from "../middleware/uploadMiddleware.js";
import { uploadDocument,getDocuments,deleteDocument } from "../controllers/documentController.js";

const router=express.Router();

router.use(protect);
router.get("/",getDocuments);
router.post("/",upload.single("file"),uploadDocument);
router.delete("/:id",deleteDocument);

export default router;