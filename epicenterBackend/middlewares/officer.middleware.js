import verificationOfficer from '../models/verification.model.js';
import { fail } from '../utils/response.js';

const requireOfficer = async(req,res,next)=>{
    try{
        if(!req.auth || req.auth.role!=="officer"){
            return fail(res,403,"Not authorized for officer access");
        }

        const officer = await verificationOfficer.findById(req.auth.id);

        if(!officer){
            return fail(res,401,"Officer no longer exists");
        }

        if(!officer.isActive){
            return fail(res,403,"Account is deactived contact the organization");
        }

        req.officer=officer;
        next();
    }catch(error){
        next(error);
    }
}

export default requireOfficer;