import { FileText, Trash2 } from "lucide-react";
import { Skeleton } from "../ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Button } from "../ui/button";

function DocumentList({ documents,loading,error,onDelete}){
    if(loading){
        return(
            <div className="space-y-3">
                <Skeleton className="h-16 w-full" />
                <Skeleton className="h-16 w-full" />
                <Skeleton className="h-16 w-full" />
            </div>
        );
    }

    if(error){
        return <p className="text-destructive" role="alert">{error}</p>;

    }

    if(documents.length===0){
        return (
            <div className="border border-dashed rounded-lg p-8 text-center">
                <FileText className="mx-auto h-10 w-10 text-muted-foreground" />
                <p className="mt-2 font-medium">No documents yet</p>
                <p className="text-sm text-muted-foreground">Upload a PDF to start learning from it.</p>

            </div>
        );
    }

    return(
        <ul className="space-y-3">
            {documents.map((doc)=>(
                <li key={doc._id} className="flex items-center justify-between gap-4 border rounded-lg p-4">
                    <div className="flex items-center gap-3 min-w-0">
                        <FileText className="h-5 w-5 shrink-0 text-muted-foreground" />
                        <div className="min-w-0">
                            <p className="font-medium truncate">{doc.title}</p>
                            <p className="text-sm text-muted-foreground truncate">{doc.fileName}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
  <Badge variant="secondary">{doc.status}</Badge>
  <Button variant="ghost" size="icon" aria-label={`Delete ${doc.title}`} onClick={() => onDelete(doc._id)}>
    <Trash2 className="h-4 w-4" />
  </Button>
</div>
                </li>
            ))}
        </ul>
    );
}
export default DocumentList;