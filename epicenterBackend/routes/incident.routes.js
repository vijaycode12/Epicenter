import { Router } from "express";

import {createIncident,track,getMyReports,getIncidentById,addPhoneToIncident,addEmailToIncident} from '../controllers/incident.controller.js';
import uploadIncidentImage from '../middlewares/upload.middleware.js';
import {protect,optionalAuth} from '../middlewares/auth.middleware.js';
import {validateIncidentReport} from '../middlewares/validation.middleware.js';

const incidentRouter = Router();

//So this api call supports both guest login and google login
//when the optionalAuth is passed then it will seen as a google login otherwise a guest
incidentRouter.post("/",optionalAuth,uploadIncidentImage,validateIncidentReport,createIncident);

incidentRouter.get("/track",track);

//Only for logged ones
incidentRouter.get("/my-reports",protect,getMyReports);

incidentRouter.get("/:id",getIncidentById);

incidentRouter.put("/:id/phone",addPhoneToIncident);

incidentRouter.put("/:id/email", addEmailToIncident);

export default incidentRouter;