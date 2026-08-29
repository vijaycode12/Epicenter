import { OAuth2Client } from "google-auth-library";
import { GOOGLE_CLIENT_ID } from "../config/env.js";
import * as logger from '../utils/logger.js';

const client = new OAuth2Client(GOOGLE_CLIENT_ID);

export const verifyGoogleToken = async(idToken)=>{
    if(!GOOGLE_CLIENT_ID){
        throw new Error("GOOGLE CLIENT ID is not configured on server");
    }
    try{
        const ticket = await client.verifyIdToken({
            idToken,
            audience:GOOGLE_CLIENT_ID,
        });

        const payload = ticket.getPayload();

        if(!payload || !payload.sub || !payload.email){
            throw new Error("Google token payload missing required fields");
        }

        return {
            googleId:payload.sub,
            email:payload.email,
            name:payload.name||"",
            avatarUrl:payload.picture||"",
            emailVerified:Boolean(payload.email.verified),
        };
    }catch(error){
        logger.error("Google token verification failed:",error.message);
        throw new Error("Invalid Google token");
    }
};