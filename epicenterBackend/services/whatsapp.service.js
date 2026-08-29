import twilio from "twilio";
import { TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_WHATSAPP_NUMBER } from "../config/env.js";
import * as logger from "../utils/logger.js";
import { buildStatusWhatsAppMessage } from "./whatsappTemplate.js";

let client = null;

const getClient = () => {
  if (client) return client;
  if (!TWILIO_ACCOUNT_SID || !TWILIO_AUTH_TOKEN) return null;
  client = twilio(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN);
  return client;
};

export const sendWhatsAppMessage = async (to, message, context = {}) => {
  const twilioClient = getClient();

  if (!twilioClient) {
    logger.warn("TWILIO_ACCOUNT_SID/TWILIO_AUTH_TOKEN not set - skipping WhatsApp notification");
    return false;
  }
  if (!TWILIO_WHATSAPP_NUMBER) {
    logger.warn("TWILIO_WHATSAPP_NUMBER not set - skipping WhatsApp notification");
    return false;
  }
  if (!to) {
    logger.warn("sendWhatsAppMessage called with no recipient - skipping");
    return false;
  }

  const cleanedNumber = to.replace(/[^\d]/g, "");
  let fullNumber = cleanedNumber;
if (cleanedNumber.length === 10) {
  fullNumber = `91${cleanedNumber}`;
} else if (cleanedNumber.length === 11 && cleanedNumber.startsWith("0")) {
  fullNumber = `91${cleanedNumber.slice(1)}`;
} else if (cleanedNumber.length === 12 && cleanedNumber.startsWith("91")) {
  fullNumber = cleanedNumber;
} else if (cleanedNumber.length > 12) {
  fullNumber = cleanedNumber.slice(-12);
}

const formattedTo = `whatsapp:+${fullNumber}`;
logger.info(`WhatsApp sending to: ${formattedTo}`);
  const body = context.incidentType && context.status
    ? buildStatusWhatsAppMessage({ ...context, message })
    : message;

  try {
    await twilioClient.messages.create({
      from: TWILIO_WHATSAPP_NUMBER,
      to: formattedTo,
      body,
    });
    return true;
  } catch (error) {
    logger.error("WhatsApp send failed (Twilio):", error.message);
    return false;
  }
};