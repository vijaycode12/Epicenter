import { config } from "dotenv";

config({path:`.env.${process.env.NODE_ENV || 'development'}.local`});

export const{
    PORT,
    NODE_ENV,
    BACKEND_URL,
    DB_URL,
    JWT_SECRET,
    JWT_EXPIRES_IN,
    ARCJET_KEY,
    CLOUDINARY_NAME,
    CLOUDINARY_API_NAME,
    CLOUDINARY_API_SECRET,
    GOOGLE_CLIENT_ID,
    EMAIL_HOST,
    EMAIL_PORT,
    EMAIL_USER,
    EMAIL_PASSWORD,
    AI_SERVICE_URL,
    TWILIO_ACCOUNT_SID,
    TWILIO_AUTH_TOKEN,
    TWILIO_WHATSAPP_NUMBER
} = process.env;