import { useState } from "react";
import {Link, Navigate,useNavigate} from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {Card, CardContent, CardDescription, CardHeader,CardTitle} from "@/components/ui/card";

function Login(){
    const { login,user }=useAuth();
    const navigate=useNavigate();
    const [email,setEmail]=useState("");
    const [password,setPassword]=useState("");
    const [error,setError]=useState("");
    const [submitting,setSubmitting]=useState(false);

    const handleSubmit=async(e)=>{
        e.preventDefault();
        setError("");
        setSubmitting(true);
        try{
            await login(email,password);
            navigate("/dashboard");
        }catch(err){
            setError(err.response?.data?.message || "Something went wrong. Try again");

        }finally{
            setSubmitting(false);
        }
    };
    if(user){
        return <Navigate to="/dashboard" replace />;
    }
    return(
        <div className="min-h-screen flex items-center justify-center p-4">
            <Card className="w-full max-w-sm">
                <CardHeader>
                    <CardTitle>Log in to DevMentor</CardTitle>
                    <CardDescription>Your AI study companion for learning new tech</CardDescription>

                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input id="email" type="email" value={email} onChange={(e)=>setEmail(e.target.value)} required/>

                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="password">Password</Label>
                            <Input id="password" type="password" value={password} onChange={(e)=>setPassword(e.target.value)} required/>

                        </div>
                        {error && <p className="text-sm text-destructive" role="alert">{error}</p>}
                        <Button type="submit" className="w-full" disabled={submitting}>
                            {submitting ? "Logging in..." : "Log in"}
                        </Button>
                    </form>

                    <p className="mt-4 text-centertext-sm">
                        No Account? <Link to="/register" className="underline">Register</Link>
                    </p>
                </CardContent>
            </Card>
        </div>
    );
}
export default Login;