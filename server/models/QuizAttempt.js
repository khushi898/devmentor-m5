import mongoose from "mongoose";
import { required } from "zod/v4/mini";

const quizAttemptSchema=new mongoose.Schema(
    {
        user:{type:mongoose.Schema.Types.ObjectId,ref:"User",required:true,index:true},
        quiz:{type:mongoose.Schema.Types.ObjectId,ref:"Quiz",required:true,index:true},
        answers:{type:[Number],required:true},
        score:{type:Number,required:true},
        total:{type:Number,required:true},
    },
    {timestamps:true}
);

const QuizAttempt=mongoose.model("QuizAttempt",quizAttemptSchema);
export default QuizAttempt;