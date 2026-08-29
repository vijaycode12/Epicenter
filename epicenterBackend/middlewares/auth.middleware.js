import {verifyToken} from '../utils/jwt.js';
import {fail} from '../utils/response.js';

export const protect = (req,res,next) =>{
    const authHeader = req.headers.authorization;

    if(!authHeader || !authHeader.startsWith("Bearer")){
        return fail(res,401,"Not authorized");
    }

    const token = authHeader.split(" ")[1];

    try{
        const decoded = verifyToken(token);
        req.auth=decoded;
        next();
    }catch(error){
        if(error.name === "TokenExpiredError"){
            return fail(res,401,"Session expired");
        }
        return fail(res,401,"Not authorized");
    }
};

export const optionalAuth = (req,res,next)=>{
    const authHeader = req.headers.authorization;

    if(!authHeader || !authHeader.startsWith("Bearer")){
        return next();
    }

    const token = authHeader.split(" ")[1];

    try{
        const decoded = verifyToken(token);
        req.auth=decoded;
    }catch(error){

    }
    next();
}