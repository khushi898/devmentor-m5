import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import { notFound,errorHandler } from "./middleware/errorHandler.js";
import authRoutes from "./routes/authRoutes.js";
import documentRoutes from "./routes/documentRoutes.js";
import chatRoutes from "./routes/chatRoutes.js";
import conversationRoutes from "./routes/conversationRoutes.js";

dotenv.config();
const app=express();
app.set("trust proxy", 1);

app.use(cors({origin:process.env.CLIENT_URL }));
app.use(express.json());

app.get("/api/health", (req ,res)=>{
    res.json({status:"ok"});
});
app.use("/api/auth",authRoutes);
app.use("/api/documents",documentRoutes);
app.use("/api/chat",chatRoutes);
app.use("/api/conversations",conversationRoutes);
app.use(notFound);
app.use(errorHandler);

const PORT=process.env.PORT || 5000;

connectDB().then(()=>{
    app.listen(PORT, ()=>console.log(`Server running on port ${PORT}`));
});