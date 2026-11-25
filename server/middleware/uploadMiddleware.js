import multer from "multer";

const upload=multer({
    storage:multer.memoryStorage(),
    limits:{fileSize:10*1024*1024},
    fileFilter:(req ,file ,cb)=>{
        if(file.mimetype==="application/pdf"){
            cb(null,true);
        }else{
            const error=new Error("Only PDF files are allowed");
            error.status=400;
            cb(error);
        }
    },
});
export default upload;