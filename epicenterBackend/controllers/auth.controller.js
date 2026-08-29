import verificationOfficer from '../models/verification.model.js';
import User from '../models/user.model.js';
import {signToken} from '../utils/jwt.js';
import {verifyGoogleToken} from '../services/googleAuth.service.js';
import {success,fail} from '../utils/response.js';

export const loginOfficer = async(req,res,next)=>{
    try{
        const {employeeId,password} = req.body;

        const officer = await verificationOfficer.findOne({employeeId}).select("+password");

        if(!officer){
            return fail(res,401,"Invalid EmployeeId or password");
        }

        if(!officer.isActive){
            return fail(res,403,"Account is deactivated");
        }

        const isMatch = await officer.matchPassword(password);

        if(!isMatch){
            return fail(res,401,'Invalid EmployeeId or password');
        }

        const token = signToken(officer._id,"officer");

        return success(res,200,"Login successful",{
            token,
            officer:{
                id:officer._id,
                employeeId:officer.employeeId,
                name:officer.name,
                email:officer.email,
            },
        });
    }catch(error){
        next(error);
    }
};

export const getMe = async(req,res,next)=>{
    try{
        return success(res,200,"Officer profile",{
            officer:req.officer
        });
    }catch(error){
        next(error);
    }
};

export const googleLogin = async(req,res,next)=>{
    try{
        const {idToken} = req.body;

        if(!idToken){
            return fail(res,400,"Id Token is invalid");
        }

        const googleProfile = await verifyGoogleToken(idToken);

        let user = await User.findOne({googleId:googleProfile.googleId});

        if(!user){
            user = await User.findOne({email:googleProfile.email,googleId:{$exists:false}});

            if(user){
                user.googleId = googleProfile.googleId;
                user.name = user.name || googleProfile.name;
                user.avatarUrl = googleProfile.avatarUrl;
                user.isGuest = false;
                await user.save();
            }else{
                user = await User.create({
                    googleId:googleProfile.googleId,
                    email:googleProfile.email,
                    name:googleProfile.name,
                    avatarUrl:googleProfile.avatarUrl,
                    isGuest:false,
                })
            }
        }

        const token = signToken(user._id,"citizen");
        return success(res,200,"Signed in with Google",{
            token,
            user:{
                id:user._id,
                name:user.name,
                email:user.email,
                avatarUrl:user.avatarUrl,
                phone:user.phone,
            },
        })
    }catch(error){
        if(error.message === "Invalid Google token"){
            return fail(res,401,"Invalid google token");
        }
        next(error);
    }
};

export const getMyProfile = async(req,res,next)=>{
    try{
        if(!req.auth || req.auth.role!=="citizen"){
            return fail(res,403,"Not authorized");
        }

        const user = await User.findById(req.auth.id);

        if(!user){
            return fail(res,401,"User no longer exists");
        }

        return success(res,200,"User profile",{
            user:{
                id:user._id,
                name:user.name,
                email:user.email,
                avatarUrl:user.avatarUrl,
                phone:user.phone,
            },
        })
    }catch(error){
        next(error);
    }
};

export const updateNotificationSettings = async (req, res, next) => {
    try {
        if (!req.auth || req.auth.role !== "citizen") {
            return fail(res, 403, "Not authorized - citizen access only");
        }

        const { phone } = req.body;

        const user = await User.findById(req.auth.id);
        if (!user) {
            return fail(res, 401, "User no longer exists");
        }

        if (phone !== undefined) {
            user.phone = phone ? phone.replace(/[^\d]/g, "") : undefined;
        }

        await user.save();

        return success(res, 200, "Notification settings updated", {
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                phone: user.phone,
            },
        });
    } catch (error) {
        next(error);
    }
};