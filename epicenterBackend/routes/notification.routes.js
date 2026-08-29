import { Router } from "express";

import {getNotification,markAsRead} from '../controllers/notification.controller.js';

const notificationRouter = Router();

notificationRouter.get("/",getNotification);
notificationRouter.put("/:id/read",markAsRead);

export default notificationRouter;