import Notification from "../models/notification.model.js";
import { success, fail } from "../utils/response.js";

export const getNotification = async (req, res, next) => {
  try {
    const { email: rawEmail } = req.query;

    if (!rawEmail) {
      return fail(res, 400, "Email is required");
    }

    const email = rawEmail.trim().toLowerCase();

    const notifications = await Notification.find({ email })
      .sort({ createdAt: -1 })
      .populate("incident", "incidentType status");

    return success(res, 200, "Notifications fetched", { notifications });
  } catch (error) {
    next(error);
  }
};

export const markAsRead = async (req, res, next) => {
  try {
    const notification = await Notification.findByIdAndUpdate(
      req.params.id,
      { isRead: true },
      { new: true }
    );

    if (!notification) {
      return fail(res, 404, "Notification not found");
    }

    return success(res, 200, "Marked as read", { notification });
  } catch (error) {
    next(error);
  }
};