import mongoose from "mongoose";
import { required } from "zod/v4/mini";

const questionSchema= new mongoose.Schema({
    question:{type:String, required:true},
    options:{type:[String], required:true},
    correctIndex:{type:Number,required:true},
    explanation:{type:String, required:true},
    page:{type:Number},
});

const quizSchema=new mongoose.Schema(
    {
        user:{type:mongoose.Schema.Types.ObjectId,ref:"User",required:true, index:true},
        document:{type:mongoose.Schema.Types.ObjectId,ref:"Document",default:null},
        title:{type:String,required:true},
        topic:{type:String,default:""},
        questions:[questionSchema],
    },
    {timestamps:true}
);
const Quiz=mongoose.model("Quiz",quizSchema);
export default Quiz;