import Incident from "../models/incident.model.js";
import { deleteImage } from "../services/cloudinary.service.js";
import {notify} from '../services/notification.service.js';
import {sortByPriority} from "../services/priority.service.js";
import { success,fail } from "../utils/response.js";

export const getIncidents = async(req,res,next)=>{
    try{
        const {status} = req.query;
        const filter = status?{status}:{};

        const incidents = await Incident.find(filter)
        .populate("verifiedBy","name employeeId")
        .lean();

        const sorted = sortByPriority(incidents);

        return success(res,200,"Incidents fetched",{incidents:sorted,count:sorted.length});
    }catch(error){
        next(error);
    }
};

export const verifyIncident = async(req,res,next)=>{
    try{
        const incident = await Incident.findById(req.params.id);

        if(!incident){
            return fail(res,404,"Incident not found");
        }

        incident.status="Verified";
        incident.verifiedBy=req.officer._id;
        await incident.save();

        await notify({
            userId:incident.reportedBy,
            phone:incident.phone,
            email:incident.email,
            incidentId:incident._id,
            type:"VERIFICATION_RESULT",
            message:`Your ${incident.incidentType} report has been verifed and is being processed.`,
        });

        return success(res,200,"Incident verified",{incident});
    }catch(error){
        next(error);
    }
};

export const rejectIncident = async(req,res,next)=>{
    try{
        const {reason} = req.body;
        const incident = await Incident.findById(req.params.id);

        if(!incident){
            return fail(res,404,"Incident not found");
        }

        incident.status="Rejected";
        incident.verifiedBy=req.officer._id;
        incident.rejectionReason=reason||"Not specified";
        await incident.save();

        if(incident.imagePublicId){
            await deleteImage(incident.imagePublicId);
        }

        await notify({
            userId:incident.reportedBy,
            phone:incident.phone,
            email:incident.email,
            incidentId:incident._id,
            type:"VERIFICATION_RESULT",
            message:`Your ${incident.incidentType} report could not be verified:${incident.rejectionReason}`,
        });

        return success(res,200,"Incident rejected",{incident});
    }catch(error){
        next(error);
    }
}

export const assignIncident = async (req, res, next) => {
  try {
    const { assignedTeam } = req.body;

    if (!assignedTeam) {
      return fail(res, 400, "assignedTeam is required");
    }

    const incident = await Incident.findById(req.params.id);

    if (!incident) {
      return fail(res, 404, "Incident not found");
    }

    incident.status = "Assigned";
    incident.assignedTeam = assignedTeam;
    await incident.save();

    await notify({
      userId: incident.reportedBy,
      phone: incident.phone,
      email:incident.email,
      incidentId: incident._id,
      type: "ASSIGNMENT",
      message: `Response team assigned to your ${incident.incidentType} report: ${assignedTeam}`,
    });

    return success(res, 200, "Incident assigned", { incident });
  } catch (error) {
    next(error);
  }
};


export const resolveIncident = async (req, res, next) => {
  try {
    const incident = await Incident.findById(req.params.id);

    if (!incident) {
      return fail(res, 404, "Incident not found");
    }

    incident.status = "Resolved";
    await incident.save();

    await notify({
      userId: incident.reportedBy,
      phone: incident.phone,
      email:incident.email,
      incidentId: incident._id,
      type: "STATUS_UPDATE",
      message: `Your ${incident.incidentType} report has been resolved.`,
    });

    return success(res, 200, "Incident resolved", { incident });
  } catch (error) {
    next(error);
  }
};

export const getStats = async(req,res,next)=>{
  try{
    const statsOfToday = new Date();
    statsOfToday.setHours(0,0,0,0);

    const [todayReports,verifiedCount,rejectedCount,pendingCount,totalCount] = await Promise.all([
      Incident.countDocuments({createdAt:{$gte:statsOfToday}}),
      Incident.countDocuments({status:"Verified"}),
      Incident.countDocuments({status:"Rejected"}),
      Incident.countDocuments({status:{$in:["Pending","AI Verified","Waiting for Verification"]}}),
      Incident.countDocuments({}),
    ]);

    const decidedCount = verifiedCount+rejectedCount;
    const acceptRate = decidedCount>0 ? Math.round((verifiedCount/decidedCount)*100) : 0;
    const rejectRate = decidedCount>0 ? Math.round((rejectedCount/decidedCount)*100):0;

    return success(res,200,"Dashboard stats",{
      todayReports,
      totalReports:totalCount,
      pendingCount,
      verifiedCount,
      rejectedCount,
      acceptRate : `${acceptRate}%`,
      rejectRate : `${rejectRate}%`,
    });
  }catch(error){
    next(error);
  }
}

export const getPublicStats = async (req, res, next) => {
    try {
        const startOfToday = new Date();
        startOfToday.setHours(0, 0, 0, 0);

        const todayCount = await Incident.countDocuments({
            createdAt: { $gte: startOfToday },
        });

        const pendingCount = await Incident.countDocuments({
            status: { $in: ["Pending", "AI Verified", "Waiting for Verification"] },
        });

        const totalCount = await Incident.countDocuments({});

        return success(res, 200, "Public stats", {
            todayReports: todayCount,
            totalReports: totalCount,
            pending: pendingCount,
        });
    } catch (error) {
        next(error);
    }
};