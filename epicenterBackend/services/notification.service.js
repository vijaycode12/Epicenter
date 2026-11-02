import Notification from "../models/notification.model.js";
import User from "../models/user.model.js";
import { sendEmail } from "./email.service.js";
import * as logger from "../utils/logger.js";


export const notify = async ({ userId = null, email = null, incidentId, type, message }) => {
  let notification = null;

  try {
    console.log("🔵 ATTEMPTING to create notification with:", { userId, email, incidentId, type, message });
    notification = await Notification.create({
      user: userId,
      email: Array.isArray(email) ? email : email ? [email] : [],
      incident: incidentId,
      type,
      message,
    });
    console.log("🟢 SUCCESS creating notification:", notification._id);
  } catch (error) {
    console.log("🔴 FULL ERROR creating notification:", error);
  }

  // Signed-in citizens get email via their linked account.
  if (userId) {
    try {
      const user = await User.findById(userId);
      if (user?.email) {
        await sendEmail({
          to: user.email,
          subject: "Disaster Report Status Update",
          message,
        });
      }
    } catch (error) {
      logger.error("Failed to send email notification:", error.message);
    }
  }

  //Guests can also get emails if they mention during their incident report
  const guestEmails = Array.isArray(email) ? email : email ? [email] : [];
  for (const address of guestEmails) {
    try {
      await sendEmail({
        to: address,
        subject: "Disaster Report Status Update",
        message,
      });
    } catch (error) {
      logger.error("Failed to send guest email notification:", error.message);
    }
  }

  return notification;
};