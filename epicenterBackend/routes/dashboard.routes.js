import { Router } from "express";

import { getIncidents,verifyIncident,rejectIncident,assignIncident,resolveIncident,getStats,getPublicStats } from "../controllers/dashboard.controller.js";
import { protect } from "../middlewares/auth.middleware.js";
import requireOfficer from '../middlewares/officer.middleware.js';

const dashboardRouter = Router();


dashboardRouter.get("/public-stats", getPublicStats);


//So to use dashboard we need to check whether the officer
//is correct and logged in
dashboardRouter.use(protect,requireOfficer);

dashboardRouter.get("/incident",getIncidents);
dashboardRouter.put("/incidents/:id/verify",verifyIncident);
dashboardRouter.put("/incident/:id/reject",rejectIncident);
dashboardRouter.put("/incident/:id/assign",assignIncident);
dashboardRouter.put("/incident/:id/resolve",resolveIncident);
dashboardRouter.get("/incident/stats",getStats);

export default dashboardRouter;