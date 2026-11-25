import mongoose from "mongoose";

const documentSchema=new mongoose.Schema(
    {
        user:{type:mongoose.Schema.Types.ObjectId ,ref:"User",required:true},
        title:{type:String,required:true,trim:true},
        fileName:{type:String,required:true},
        fileSize:{type:Number,required:true},
        pageCount:{type:Number,default:0},
        chunkCount:{type:Number,default:0},
        status:{type:String,enum:["processing","ready","failed"],default:"processing"},  
    },
    { timestamps:true}
);
const Document=mongoose.model("Document",documentSchema);
export default Document;