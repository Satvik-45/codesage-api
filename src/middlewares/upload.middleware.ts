import multer from "multer";
import path from "path";
import fs from "fs";
const tmpDir = "./tmp";
if (!fs.existsSync(tmpDir)) {
    fs.mkdirSync(tmpDir, { recursive: true });
}
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, tmpDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    },
});
const fileFilter = (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
    const ext = path.extname(file.originalname).toLowerCase();
    if (ext !== ".zip") {
        return cb(new Error("Only .zip files are allowed"));
    }
    cb(null, true);
};
export const uploadZip = multer({
    storage,
    fileFilter,
    limits: {
        fileSize: 100 * 1024 * 1024,
    },
}).single("file");
