import Incident from '../models/incident.model.js';
import User from '../models/user.model.js';
import {uploadImageBuffer} from '../services/cloudinary.service.js';
import {isValidCoordinate , reverseGeocode,findNearbyDuplicate} from '../services/location.service.js';
import { analyzeImage,analyzeText,combineSignals } from '../services/ai.service.js';
import {success,fail} from '../utils/response.js';
import * as logger from '../utils/logger.js';

// Contact phone is for officers only - strip it from anything a citizen/guest can fetch.
const hidePhone = (incident) => {
    if(!incident) return incident;
    const obj = typeof incident.toObject === "function" ? incident.toObject() : {...incident};
    delete obj.contactPhone;
    return obj;
};

export const createIncident = async(req,res,next)=>{
    try{
        const {incidentType,description,latitude,longitude,manualAddress,email:rawEmail,phone:rawPhone} = req.body;
        const contactPhone = rawPhone ? String(rawPhone).replace(/[^\d+]/g, "").slice(0,15) : undefined;

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
        }else if(email){
            let user = await User.findOne({email});
            if(!user){
                user = await User.create({email,isGuest:true});
            }
            reportedBy = user._id;
        }

        if (location.latitude && location.longitude) {
            const duplicate = await findNearbyDuplicate(incidentType, location.latitude, location.longitude);

            if (duplicate) {
                if (email && Array.isArray(duplicate.email) && !duplicate.email.includes(email)) {
                    duplicate.email.push(email);
                    duplicate.duplicateReportCount += 1;
                    await duplicate.save();
                }

                if (contactPhone && !duplicate.contactPhone) {
                    duplicate.contactPhone = contactPhone;
                    await duplicate.save();
                }

                return success(res, 200, "This incident has already been reported and is being handled. Add your email to receive updates.", {
                    incident: hidePhone(duplicate),
                    isDuplicate: true,
                });
            }
        }

        const incident = await Incident.create({
            reportedBy,
            email: email ? [email] : [],
            contactPhone: contactPhone || undefined,
            incidentType,
            description:description?.trim()||undefined,
            imageUrl,
            imagePublicId,
            location,
        });

        if(reportedBy){
            await User.findByIdAndUpdate(reportedBy,{$push:{reports:incident._id}});
        }

        success(res,201,"Incident reported successfully",{incident:hidePhone(incident)});

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
        const {email:rawEmail} = req.query;

        if(!rawEmail){
            return fail(res,400,"Email is required");
        }
        const email = rawEmail.trim().toLowerCase();

        const incidents = await Incident.find({email}).sort({createdAt:-1});
        return success(res,200,"Reports found",{incidents:incidents.map(hidePhone)});
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
        return success(res,200,"incident found",{incident: req.auth?.role === "officer" ? incident : hidePhone(incident)});
    }catch(error){
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