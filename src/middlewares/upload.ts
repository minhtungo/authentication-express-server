import { Buffer } from "node:buffer";
import multer from "multer";

// Configure multer for memory storage
export const upload = multer({
  dest: "uploads/",
  //   storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
});
