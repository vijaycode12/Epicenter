import { fail } from "../utils/response.js";
import {INCIDENT_TYPES} from "../utils/constants.js";

export const validateIncidentReport = (req,res,next)=>{
    const {incidentType, latitude,longitude,manualAddress} = req.body;

    if(!incidentType || !INCIDENT_TYPES.includes(incidentType)){
        return fail(res,400,`Incident types must be one of :${INCIDENT_TYPES.join(", ")}`);
    }

    const hasCoords = latitude!==undefined && longitude!==undefined;
    const hasManualAddress = manualAddress && manualAddress.trim().length>0;

    if (!hasCoords && !hasManualAddress) {
        return fail(res, 400, "Location is required provide GPS coordinates or a manual address");
    }

    if (!req.file) {
        return fail(res, 400, "Incident image is required");
    }
    next();
}

export const validateOfficerLogin = (req, res, next) => {
    const { employeeId, password } = req.body;

    if (!employeeId || !password) {
        return fail(res, 400, "Employee ID and password are required");
    }
    next();
};