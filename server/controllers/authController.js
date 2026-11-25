import bcrypt from "bcryptjs";
import User from "../models/User.js";
import generateToken from "../utils/generateToken.js";

export const register= async( req , res )=>{
    const {name,email,password}= req.body || {};

    if(!name || !email ||!password){
        return res.status(400).json({
            message:"Name,email and password are required"
        });
    }
     if(password.length < 6){
        return res.status(400).json({
            message:"Password must be 6 characters atleast!"
        });
    }

    const existingUser= await User.findOne({
        email:email.toLowerCase()
    });
    if(existingUser){
        return res.status(409).json({
            message:"Email is already registered"
        })
    }

    const hashedPassword= await bcrypt.hash(password,10);
    const user=await User.create({
        name, email , password: hashedPassword
    });

    res.status(201).json({
        token:generateToken(user._id),
        user: {id:user._id, name:user.name, email:user.email},
    });
};

export const login=async(req, res)=>{
    const {email,password}=req.body || {};

    if(!email || !password){
        return res.status(400).json({
            message:"Email and password are required"
        });
    }
    const user=await User.findOne({
        email:email.toLowerCase()
    }).select("+password");

    if(!user){
        return res.status(401).json({
            message:"Invalid email or password"
        });
    }

    const isMatch =await bcrypt.compare(password,user.password);
    if(!isMatch){
        return res.status(401).json({
            message:"Invalid email or password"
        });
    }
    res.json({
        token:generateToken(user._id),
        user: {id: user._id, name:user.name,email:user.email},
    });
};