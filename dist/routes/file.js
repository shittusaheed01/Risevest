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
const express_validator_1 = require("express-validator");
const cloudinary_1 = require("cloudinary");
const axios_1 = __importDefault(require("axios"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const db_1 = require("../db");
const validate_request_1 = require("../middlewares/validate-request");
const bad_request_error_1 = require("../errors/bad-request-error");
const current_user_1 = require("../middlewares/current-user");
const require_auth_1 = require("../middlewares/require-auth");
const multer_1 = require("../middlewares/multer");
const not_authorized_error_1 = require("../errors/not-authorized-error");
const router = express_1.default.Router();
exports.fileRouter = router;
cloudinary_1.v2.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_SECRET_KEY,
});
//Gets All Users Files
router.get('/api/file', current_user_1.currentUser, require_auth_1.requireAuth, (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const files = yield db_1.db.query(`SELECT * FROM files WHERE user_id = $1 ORDER BY id DESC`, [(_a = req.user) === null || _a === void 0 ? void 0 : _a.id]);
        const filesObj = files.rows;
        if (!filesObj.length) {
            throw new bad_request_error_1.BadRequestError('No file found');
        }
        res.status(200).json({
            status: 'success',
            results: files.rows.length,
            data: {
                files: filesObj,
            },
        });
    }
    catch (error) {
        console.log(error);
        next(error);
    }
}));
//Admin Gets All Users Files
router.get('/api/file/admin', current_user_1.currentUser, require_auth_1.requireAuth, (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _b;
    try {
        const admin = yield db_1.db.query(`SELECT role FROM users WHERE id = $1 AND role = 'admin'`, [(_b = req.user) === null || _b === void 0 ? void 0 : _b.id]);
        const adminObj = admin.rows;
        if (!adminObj.length) {
            throw new not_authorized_error_1.NotAuthorizedError();
        }
        const files = yield db_1.db.query(`SELECT * FROM files ORDER BY id DESC`);
        const filesObj = files.rows;
        if (!filesObj.length) {
            throw new bad_request_error_1.BadRequestError('No file uploaded');
        }
        res.status(200).json({
            status: 'success',
            results: files.rows.length,
            data: {
                files: filesObj,
            },
        });
    }
    catch (error) {
        console.log(error);
        next(error);
    }
}));
//Download File
router.get('/api/file/download/:fileId', 
// currentUser,
// requireAuth,
(req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { fileId } = req.params;
    // const user_id = req.user?.id;
    try {
        //find file in db and make sure it belongs to the user
        const file = yield db_1.db.query(`SELECT * FROM files WHERE id = $1`, [fileId]);
        const filesObj = file.rows;
        if (!filesObj.length) {
            throw new bad_request_error_1.BadRequestError('No file found');
        }
        //get the file url and file name from db
        const { url, name } = filesObj[0];
        const lastDotIndex = url.lastIndexOf('.');
        const ext = url.substring(lastDotIndex + 1);
        // Set the local path where you want to save the downloaded file
        const userDownloadFolder = path_1.default.join(require('os').homedir(), 'Downloads', `${name}_${Math.floor(Math.random() * 100000)}.${ext}`);
        console.log(userDownloadFolder);
        (0, axios_1.default)({
            method: 'get',
            url,
            responseType: 'stream', // Specify the response type as stream
        })
            .then((response) => {
            // Create a writable stream to save the downloaded data
            const writer = fs_1.default.createWriteStream(userDownloadFolder);
            // Pipe the response stream to the writer
            response.data.pipe(writer);
            // When the download is complete, handle any necessary cleanup
            writer.on('finish', () => {
                console.log('File downloaded and saved to Downloads folder.');
                return res.status(200).json({
                    success: true,
                    message: `File downloaded and saved to user's download folder.`,
                    folder: userDownloadFolder,
                });
            });
            // Handle errors during download
            writer.on('error', (err) => {
                console.error('Error downloading and saving file:', err);
                return res.status(400).json({
                    errors: [
                        {
                            success: false,
                            message: 'Error downloading and saving file',
                        },
                    ],
                });
            });
        })
            .catch((error) => {
            console.error('Error fetching Cloudinary URL:', error);
            res.status(400).json({
                errors: [
                    {
                        success: false,
                        message: 'Error fetching File',
                    },
                ],
            });
        });
    }
    catch (error) {
        console.log(error);
        next(error);
    }
}));
//Upload File
router.post('/api/file/upload', current_user_1.currentUser, require_auth_1.requireAuth, multer_1.multerMiddleware, [
    (0, express_validator_1.body)('name')
        .optional()
        .trim()
        .matches(/^[a-zA-Z0-9_]+$/)
        .withMessage('Name must be alphanumeric and underscore only'),
], validate_request_1.validateRequest, (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { name } = req.body;
    try {
        if (!req.file) {
            throw new bad_request_error_1.BadRequestError('Attach a file to upload');
        }
        //check file type
        let resource_type;
        let type;
        const { mimetype } = req.file;
        if (mimetype.includes('image')) {
            resource_type = 'image';
            type = 'image';
        }
        else if (mimetype.includes('video')) {
            resource_type = 'video';
            type = 'video';
        }
        else {
            resource_type = 'raw';
            type = mimetype.split('/')[0];
        }
        //upload file to cloudinary, check file size and save file to db
        if (req.file.size > 99 * 1024 * 1024) {
            console.log('large file');
            cloudinary_1.v2.uploader.upload_large(req.file.path, { resource_type, folder: 'risevest' }, function (err, result) {
                var _a;
                return __awaiter(this, void 0, void 0, function* () {
                    if (err) {
                        console.log(err);
                        return res.status(400).json({
                            errors: [{ message: err.message }],
                        });
                    }
                    const { secure_url: url } = result;
                    //save file to db
                    const newFile = yield db_1.db.query(`INSERT INTO files (user_id, name, url, type) VALUES ($1, $2, $3, $4) RETURNING *`, [
                        (_a = req.user) === null || _a === void 0 ? void 0 : _a.id,
                        name ? `${name}_${Date.now()}` : `${Date.now()}`,
                        url,
                        type,
                    ]);
                    const newFileObj = newFile.rows[0];
                    return res.status(200).json({
                        success: true,
                        message: 'Uploaded!',
                        data: {
                            file: newFileObj,
                        },
                    });
                });
            });
        }
        else {
            cloudinary_1.v2.uploader.upload(req.file.path, { resource_type, folder: 'risevest' }, function (err, result) {
                var _a;
                return __awaiter(this, void 0, void 0, function* () {
                    if (err) {
                        console.log(err);
                        return res.status(400).json({
                            errors: [{ message: err.message }],
                        });
                    }
                    const { secure_url: url } = result;
                    //save file to db
                    const newFile = yield db_1.db.query(`INSERT INTO files (user_id, name, url, type) VALUES ($1, $2, $3, $4) RETURNING *`, [
                        (_a = req.user) === null || _a === void 0 ? void 0 : _a.id,
                        name
                            ? `${name}_${new Date().getTime()}`
                            : `${new Date().getTime()}`,
                        url,
                        type,
                    ]);
                    const newFileObj = newFile.rows[0];
                    return res.status(200).json({
                        success: true,
                        message: 'Uploaded!',
                        data: {
                            file: newFileObj,
                        },
                    });
                });
            });
        }
    }
    catch (error) {
        console.log(error);
        next(error);
    }
}));
