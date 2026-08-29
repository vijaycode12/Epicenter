import {v2 as cloudinary} from 'cloudinary';
import { CLOUDINARY_NAME,CLOUDINARY_API_NAME,CLOUDINARY_API_SECRET } from '../config/env.js';

cloudinary.config({
    cloud_name:CLOUDINARY_NAME,
    api_key:CLOUDINARY_API_NAME,
    api_secret:CLOUDINARY_API_SECRET,
    secure:true,
});

export default cloudinary;