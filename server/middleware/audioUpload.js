import multer from "multer";

const audioUpload=multer({
    storage:multer.memoryStorage(),
    limits:{fileSize:10*1024*1024},
    fileFilter: (req, file, cb)=>{
        if(file.mimetype.startsWith("audio/")|| file.mimetype==="video/webm" ){
            cb(null,true);
        }else{
            const error=new Error("Only audio recordings are allowed");
            error.status=400;
            cb(error);
        }
    },
});

export default audioUpload;