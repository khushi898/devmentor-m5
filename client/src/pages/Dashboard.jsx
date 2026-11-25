import { useEffect,useState } from "react";
import { useAuth } from "@/context/AuthContext";
import api from "@/api/axios";
import { Button } from "@/components/ui/button";
import DocumentList from "@/components/documents/DocumentList";

function Dashboard(){
    const {user,logout}=useAuth();
    const [documents,setDocuments]=useState([]);
    const [loading,setLoading]=useState(true);
    const [error,setError]=useState("");
    

    useEffect(()=>{
        api  
         .get("/documents")
         .then((res)=>setDocuments(res.data.documents))
         .catch(()=>setError("Could not load your documents. Please refresh the page."))
         .finally(()=>setLoading(false));
    },[])

    return(
        <div className="min-h-screen p-4 md:p-8 max-w-4xl mx-auto">
            <div className="flex items-center justify-between gap-4">
                <h1 className="text-2xl font-bold">Welcome, {user.name}</h1>
                <Button variant="outline" onClick={logout}>Log out</Button>
            </div>

            <section className="mt-8">
                <h2 className="text-lg font-semibold mb-4">Your documents</h2>
                <DocumentList documents={documents} loading={loading} error={error} />
            </section>
        </div>
    );
}

export default Dashboard;