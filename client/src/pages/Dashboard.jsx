import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";

function Dashboard(){
    const {user,logout}=useAuth();

    return(
        <div className="min-h-screen p-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold">Welcome, {user.name}</h1>
                <Button variant="outline" onClick={logout}>Log out</Button>
            </div>
            <p className="mt-4 text-muted-foreground">Your documents will appears here.</p>
        </div>
    );
}

export default Dashboard;