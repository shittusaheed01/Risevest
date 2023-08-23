"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.fileRouter = void 0;
const express_1 = __importDefault(require("express"));
const cloudinary_1 = require("cloudinary");
const axios_1 = __importDefault(require("axios"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const db_1 = require("../db");
const bad_request_error_1 = require("../errors/bad-request-error");
const current_user_1 = require("../middlewares/current-user");
const require_auth_1 = require("../middlewares/require-auth");
const multer_1 = require("../middlewares/multer");
const router = express_1.default.Router();
exports.fileRouter = router;
cloudinary_1.v2.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_SECRET_KEY,
});
router.get('/api/file', current_user_1.currentUser, require_auth_1.requireAuth, (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const folders = yield db_1.db.query(`SELECT * FROM folders WHERE user_id = $1`, [(_a = req.user) === null || _a === void 0 ? void 0 : _a.id]);
        const foldersObj = folders.rows;
        if (!foldersObj.length) {
            throw new bad_request_error_1.BadRequestError('No folders found');
        }
        res.status(200).json({
            status: 'success',
            results: folders.rows.length,
            data: {
                folders: folders.rows,
            },
        });
    }
    catch (error) {
        console.log(error);
        next(error);
    }
}));
router.post('/api/file/upload', current_user_1.currentUser, require_auth_1.requireAuth, multer_1.multerMiddleware, (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { name } = req.body;
    try {
        if (!req.file) {
            throw new bad_request_error_1.BadRequestError('Attach a file to upload');
        }
        if (req.file.size > 99 * 1024 * 1024) {
            cloudinary_1.v2.uploader.upload_large(req.file.path, { resource_type: 'video' }, function (err, result) {
                if (err) {
                    console.log(err);
                    return res.status(500).json({
                        success: false,
                        message: 'Error',
                    });
                }
                res.status(200).json({
                    success: true,
                    message: 'Uploaded!',
                    data: result,
                });
            });
        }
        else {
            cloudinary_1.v2.uploader.upload(req.file.path, function (err, result) {
                if (err) {
                    console.log(err);
                    return res.status(500).json({
                        success: false,
                        message: 'Error',
                    });
                }
                res.status(200).json({
                    success: true,
                    message: 'Uploaded!',
                    data: result,
                });
            });
        }
    }
    catch (error) {
        console.log(error);
        next(error);
    }
}));
router.get('/api/file/download/:fileId', current_user_1.currentUser, require_auth_1.requireAuth, (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _b;
    const { fileId } = req.params;
    const user_id = (_b = req.user) === null || _b === void 0 ? void 0 : _b.id;
    try {
        //find file in db and make sure it belongs to the user
        //get the file url and file name from db
        // Cloudinary URL of the file you want to download
        const cloudinaryUrl = 'YOUR_CLOUDINARY_URL_HERE';
        // Set the local path where you want to save the downloaded file
        const localFilePath = path_1.default.join(__dirname, 'downloaded_file.jpg');
        (0, axios_1.default)({
            method: 'get',
            url: cloudinaryUrl,
            responseType: 'stream', // Specify the response type as stream
        })
            .then((response) => {
            // Create a writable stream to save the downloaded data
            const writer = fs_1.default.createWriteStream(localFilePath);
            // Pipe the response stream to the writer
            response.data.pipe(writer);
            // When the download is complete, handle any necessary cleanup
            writer.on('finish', () => {
                console.log('File downloaded and saved.');
            });
            // Handle errors during download
            writer.on('error', (err) => {
                console.error('Error downloading and saving file:', err);
            });
        })
            .catch((error) => {
            console.error('Error fetching Cloudinary URL:', error);
        });
    }
    catch (error) {
        console.log(error);
        next(error);
    }
}));
