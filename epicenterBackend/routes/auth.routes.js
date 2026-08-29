import { Router } from "express";

import {loginOfficer,getMe,getMyProfile,googleLogin,updateNotificationSettings} from '../controllers/auth.controller.js';
import {validateOfficerLogin} from '../middlewares/validation.middleware.js';
import { protect } from "../middlewares/auth.middleware.js";
import requireOfficer from '../middlewares/officer.middleware.js';

const authRouter = Router();

//For validating officers
authRouter.post("/officer/login",validateOfficerLogin,loginOfficer);
authRouter.get("/officer/me",protect,requireOfficer,getMe);

//For citizens
authRouter.post("/google",googleLogin);
authRouter.get("/me",protect,getMyProfile);

authRouter.put("/me/notifications", protect, updateNotificationSettings);

export default authRouter;