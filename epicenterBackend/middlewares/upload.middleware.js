import multer from "multer";
import { upload } from "../config/multer.js";
import { fail } from "../utils/response.js";

const uploadIncidentImage = (req, res, next) => {
  const handler = upload.single("image");

  handler(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      if (err.code === "LIMIT_FILE_SIZE") {
        return fail(res, 400, "Image must be under 5MB");
      }
      return fail(res, 400, `Upload error: ${err.message}`);
    }
    if (err) {
      return fail(res, 400, err.message || "Image upload failed");
    }
    next();
  });
};

export default uploadIncidentImage;