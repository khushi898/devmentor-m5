import { useState } from "react";
import api from "@/api/axios";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import {Label} from "@/components/ui/label";

const MAX_SIZE=10*1024*1024;

function UploadForm({ onUploaded }) {
const [file,setFile]=useState(null);
const [title,setTitle]=useState("");
const [error,setError]=useState("");
const [uploading,setUploading]=useState(false);
const handleFileChange=(e)=>{
    const selected=e.target.files[0];
    setError("");
    setFile(null);
    if(!selected) return;
    if(selected.type !== "application/pdf"){
        setError("Please choose a PDF file");
        return;
    }
    setFile(selected);
};

const handleSubmit=async(e)=>{
    e.preventDefault();
    if(!file){
        setError("Please choose a PDF file");
        return;
    }

    const formData=new FormData();
    formData.append("file",file);
    formData.append("title",title);

    setUploading(true);
    setError("");

    try{
        const res=await api.post("/documents",formData);
        onUploaded(res.data.document);
        setFile(null);
        setTitle("");
        e.target.reset();
    }catch(err){
        setError(err.response?.data?.message || "Upload failed.Please try again.");

    }finally{
        setUploading(false);
    }
};
return(
    <form onSubmit={handleSubmit} className="border rounded-lg p-4 space-y-4">
        <div className="space-y-2">
            <Label htmlFor="file">PDF file (max 10 MB)</Label>
            <Input id="file" type="file" accept="application/pdf" onChange={handleFileChange} /> 
        </div>
        <div className="space-y-2">
            <Label htmlFor="title">Title (optional)</Label>
            <Input id="title" value="title" onChange={(e)=>setTitle(e.target.value)} placeholder="e.g. React Docs" /> 
        </div>
        {error && <p className="text-sm text-destructive" role="alert">{error}</p>}
        <Button type="submit" disabled={uploading || !file}>
            {uploading ? "Uploading..." : "Upload PDF"}
        </Button>

    </form>
);
}
export default UploadForm;
