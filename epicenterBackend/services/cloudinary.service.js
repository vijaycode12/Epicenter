import cloudinary from "./cloudinary.js";
import * as logger from '../utils/logger.js';

export const uploadImageBuffer = (buffer,folder="disaster-reports")=>{
    return new Promise((resolve,reject)=>{
        const uploadStream = cloudinary.uploader.upload_stream(
            {
                folder,
                resource_type:"image",
                transformation:[{width:1280,height:1280,crop:"limit"}],
            },
            (error,result)=>{
                if(error){
                    logger.error("Cloudinary upload failed:",error.message);
                    return reject(error);
                }
                resolve({url:result.secure_url,publicId:result.public_id});
            }
        );

        uploadStream.end(buffer);
    })
};

export const deleteImage = async(publicId)=>{
    if(!publicId) return;
    try{
        await cloudinary.uploader.destroy(publicId);
    }catch(error){
        logger.error("Cloudinary delete failed:",error.message);
    }
};