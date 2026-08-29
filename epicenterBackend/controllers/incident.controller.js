import Incident from '../models/incident.model.js';
import User from '../models/user.model.js';
import {uploadImageBuffer} from '../services/cloudinary.service.js';
import {isValidCoordinate , reverseGeocode,findNearbyDuplicate} from '../services/location.service.js';
import { analyzeImage,analyzeText,combineSignals } from '../services/ai.service.js';
import {success,fail} from '../utils/response.js';
import * as logger from '../utils/logger.js';

export const createIncident = async(req,res,next)=>{
    try{
        const {incidentType,description,latitude,longitude,manualAddress,phone:rawPhone,email:rawEmail} = req.body;
        const phone = rawPhone ? rawPhone.replace(/[^\d]/g, "") : rawPhone;

        const email = rawEmail ? rawEmail.trim().toLowerCase() : rawEmail;

        const {url:imageUrl , publicId:imagePublicId} = await uploadImageBuffer(req.file.buffer);

        const location ={};
        if(isValidCoordinate(latitude,longitude)){
            location.latitude=Number(latitude);
            location.longitude=Number(longitude);
        }

        if(manualAddress){
            location.manualAddress = manualAddress.trim();
        }

        let reportedBy = null;

        if(req.auth?.role === "citizen"){
            reportedBy=req.auth.id;
        }else if(phone){
            let user = await User.findOne({phone});
            if(!user){
                user = await User.create({phone,isGuest:true});
            }
            reportedBy = user._id;
        }

        if (location.latitude && location.longitude) {
            const duplicate = await findNearbyDuplicate(incidentType, location.latitude, location.longitude);

            if (duplicate) {
                if (phone && Array.isArray(duplicate.phone) &&  !duplicate.phone.includes(phone)) {
                    duplicate.phone.push(phone);
                    duplicate.duplicateReportCount += 1;
                    await duplicate.save();
                }

                return success(res, 200, "This incident has already been reported and is being handled. Keep your phone number for updates.", {
                    incident: duplicate,
                    isDuplicate: true,
                });
            }
        }

        const incident = await Incident.create({
            reportedBy,
            phone:phone ? [phone] : [],
            email: email ? [email] : [],
            incidentType,
            description:description?.trim()||undefined,
            imageUrl,
            imagePublicId,
            location,
        });

        if(reportedBy){
            await User.findByIdAndUpdate(reportedBy,{$push:{reports:incident._id}});
        }

        success(res,201,"Incident reported successfully",{incident});

        if(location.latitude && location.longitude){
            reverseGeocode(location.latitude,location.longitude)
            .then(async(placeName)=>{
                if(placeName){
                    incident.location.placeName = placeName;
                    await incident.save();
                }
            })
            .catch((error)=>{
                logger.error("Geocoding failed:",error.message);
            });
        }

        const imageAnalysis = analyzeImage(incident.imageUrl,incident.incidentType);
        const textAnalysis = analyzeText(incident.description, incident.incidentType);

        Promise.all([imageAnalysis,textAnalysis])
        .then(async([imageResult,textResult])=>{
            const {overallMismatch,severity} = combineSignals(imageResult,textResult);

            incident.ai={
                image:imageResult,
                text:textResult||undefined,
                overallMismatch,
                severity,
            };

            incident.status=imageResult.detectedClass||textResult?.predictedType
            ?"AI Verified"
            :"Waiting for Verification";

            incident.aiCompletedAt = new Date();
            
            await incident.save();
        })
       .catch((error)=>{
            logger.error("AI analysis failed:",error.message);
        });

        return;
    }catch(error){
        logger.error("createIncident failed:",error.message);
        next(error);
    }
};

export const track = async(req,res,next)=>{
    try{
        const {phone:rawPhone} = req.query;

        if(!rawPhone){
            return fail(res,400,"Phone number is required");
        }
        const phone = rawPhone.replace(/[^\d]/g, "");
        
        const incidents = await Incident.find({phone}).sort({createdAt:-1});
        return success(res,200,"Reports found",{incidents});
    }catch(error){
        next(error);
    }
};

export const getMyReports = async(req,res,next)=>{
    try{
        if(!req.auth||req.auth.role!=="citizen"){
            return fail(res,403,"Not authorized");
        }
        const incidents = await Incident.find({reportedBy:req.auth.id}).sort({createdAt:-1});
        return success(res,200,"Your reports",{incidents});
    }catch(error){
        next(error);
    }
};

export const getIncidentById = async(req,res,next)=>{
    try{
        const incident = await Incident.findById(req.params.id);

        if(!incident){
            return fail(res,404,"Incident not found");
        }
        return success(res,200,"incident found",{incident});
    }catch(error){
        next(error);
    }
};

export const addPhoneToIncident = async (req, res, next) => {
    try {
        const { phone } = req.body;

        if (!phone || !phone.trim()) {
            return fail(res, 400, "Phone number is required");
        }

        const incident = await Incident.findById(req.params.id);

        if (!incident) {
            return fail(res, 404, "Incident not found");
        }

        const normalizedPhone = phone.replace(/[^\d]/g, "");

        if (!Array.isArray(incident.phone)) {
            incident.phone = incident.phone ? [incident.phone] : [];
        }

        if (!incident.phone.includes(normalizedPhone)) {
            incident.phone.push(normalizedPhone);
        }

        let user = await User.findOne({ phone: normalizedPhone });
        if (!user) {
            user = await User.create({ phone: normalizedPhone, isGuest: true });
        }
        if (!incident.reportedBy) {
            incident.reportedBy = user._id;
        }

        await incident.save();

        return success(res, 200, "Phone number added", { incident });
    } catch (error) {
        next(error);
    }
};

export const addEmailToIncident = async (req, res, next) => {
    try {
        const { email } = req.body;
        if (!email || !email.trim()) {
            return fail(res, 400, "Email is required");
        }
        const incident = await Incident.findById(req.params.id);
        if (!incident) {
            return fail(res, 404, "Incident not found");
        }
        const normalizedEmail = email.trim().toLowerCase();
        if (!Array.isArray(incident.email)) {
            incident.email = incident.email ? [incident.email] : [];
        }
        if (!incident.email.includes(normalizedEmail)) {
            incident.email.push(normalizedEmail);
        }
        await incident.save();
        return success(res, 200, "Email added", { incident });
    } catch (error) {
        next(error);
    }
};