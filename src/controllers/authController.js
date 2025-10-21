const user=require('../models/User');
const {generateToken}=require('../config/auth');
const {validationResult}=require('express-validator');
// @desc Register a new user
// @route POST /api/auth/register
const register=async(req,res)=>{
    try{
        const errors=validationResult(req);
        if(!errors.isEmpty()){
            return res.status(400).json({success:false,errors:errors.array()});
        }
        const {name,email,password,role,department,studentId,staffId,phoneNumber}=req.body;
        const userExists=await user.findOne({email});
        if(userExists){
            return res.status(400).json({success:false,message:'User with this email already exists'});
        }
        if(studentId){
            const studentExists=await user.findOne({studentId});
            if(studentExists){
                return res.status(400).json({success:false,message:'Student ID already Registered'});
            }
        }
        if(staffId){
            const staffExists=await user.findOne({staffId});
            if(staffExists){
                return res.status(400).json({success:false,message:'Staff ID already Registered'});
            }
        }
        const User= await user.create({name,email,password,role:role||'student',department,studentId,staffId,phoneNumber});
        const token=generateToken(User._id);
        res.status(201).json({success:true,message:'User registered successfully',data:{id:User._id,name:User.name,email:User.email,role:User.role,department:User.department,studentId:User.studentId,staffId:User.staffId,phoneNumber:User.phoneNumber,token}});
    }catch(error){
        console.error(error);
        res.status(500).json({success:false,message:'Server Error during registration',error:error.message});
    }
};
// @desc Login user
// @route POST /api/auth/login
const login=async(req,res)=>{
    try{
        const errors=validationResult(req);
        if(!errors.isEmpty()){
            return res.status(400).json({success:false,errors:errors.array()});
        }
        const {email,password}=req.body;
        const User=await user.findOne({email}).select('+password');
        if(!User){
            return res.status(401).json({success:false,message:'Invalid email or password'});
        }
        const isPasswordMatch=await User.matchPassword(password);
        if(!isPasswordMatch){
            return res.status(401).json({success:false,message:'Invalid email or password'});
        }
        if(!User.isActive){
            return res.status(401).json({success:false,message:'User account is deactivated'});
        }
        const token=generateToken(User._id);
        res.status(200).json({success:true,message:'User logged in successfully',data:{id:User._id,name:User.name,email:User.email,role:User.role,department:User.department,studentId:User.studentId,staffId:User.staffId,phoneNumber:User.phoneNumber,token}});
    }catch(error){
        console.error(error);
        res.status(500).json({success:false,message:'Server Error during login',error:error.message});
    }
};
// @desc Get current logged in user
// @route GET /api/auth/me
const getMe=async(req,res)=>{
    try{
        const User=await user.findById(req.user.id);
        res.status(200).json({success:true,data:User});
    }catch(error){
        console.error(error);
        res.status(500).json({success:false,message:'Server Error fetching user data',error:error.message});
    }
};
module.exports={register,login,getMe};


