import nodemailer from "nodemailer";
import { EMAIL_HOST, EMAIL_PORT, EMAIL_USER, EMAIL_PASSWORD } from "../config/env.js";
import * as logger from "../utils/logger.js";
import { buildStatusEmailHtml } from "./emailTemplate.js";

let transporter = null;

const getTransporter = () => {
  if (transporter) return transporter;
  if (!EMAIL_USER || !EMAIL_PASSWORD) return null;

  transporter = nodemailer.createTransport({
    host: EMAIL_HOST,
    port: Number(EMAIL_PORT),
    secure: false,
    auth: { user: EMAIL_USER, pass: EMAIL_PASSWORD },
  });
  return transporter;
};


export const sendEmail = async ({ to, subject, message, incidentType, status, location }) => {
  const mailer = getTransporter();

  if (!mailer) {
    logger.warn("EMAIL_USER/EMAIL_PASSWORD not set - skipping email notification");
    return false;
  }

  try {
    const html = buildStatusEmailHtml({
      incidentType: incidentType || "Incident",
      status: status || "Update",
      message,
      location,
    });

    await mailer.sendMail({
      from: `"Epicenter" <${EMAIL_USER}>`,
      to,
      subject,
      text: message,
      html,
    });
    return true;
  } catch (error) {
    logger.error("Failed to send email:", error.message);
    return false;
  }
};