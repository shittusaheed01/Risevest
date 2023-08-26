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
exports.folderRouter = void 0;
const express_1 = __importDefault(require("express"));
const express_validator_1 = require("express-validator");
const db_1 = require("../db");
const validate_request_1 = require("../middlewares/validate-request");
const bad_request_error_1 = require("../errors/bad-request-error");
const current_user_1 = require("../middlewares/current-user");
const require_auth_1 = require("../middlewares/require-auth");
const router = express_1.default.Router();
exports.folderRouter = router;
//Gets All User's Folder
router.get('/api/folder', current_user_1.currentUser, require_auth_1.requireAuth, (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const folders = yield db_1.db.query(`SELECT * FROM folders WHERE user_id = $1 ORDER BY id DESC`, [(_a = req.user) === null || _a === void 0 ? void 0 : _a.id]);
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
//Gets a Single Folder
router.get('/api/folder/:id', current_user_1.currentUser, require_auth_1.requireAuth, (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _b;
    try {
        const folders = yield db_1.db.query(`SELECT * FROM files WHERE user_id = $1 AND folder_id = $2 ORDER BY id DESC`, [(_b = req.user) === null || _b === void 0 ? void 0 : _b.id, req.params.id]);
        const foldersObj = folders.rows;
        if (!foldersObj.length) {
            throw new bad_request_error_1.BadRequestError('No folder found');
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
//Create Folder
router.post('/api/folder', current_user_1.currentUser, require_auth_1.requireAuth, [
    (0, express_validator_1.body)('name')
        .isString()
        .trim()
        .withMessage('Folder name must be defined'),
    (0, express_validator_1.body)('file')
        .optional()
        .isString()
        .withMessage('File ID must be defined'),
], validate_request_1.validateRequest, (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _c, _d;
    const { name, file } = req.body;
    try {
        // Check if user already created folder with same name
        const existingFolder = yield db_1.db.query(`SELECT * FROM folders WHERE name = $1 AND user_id = $2`, [name, (_c = req.user) === null || _c === void 0 ? void 0 : _c.id]);
        if (existingFolder.rows.length > 0) {
            throw new bad_request_error_1.BadRequestError('Folder already exists, please choose another name');
        }
        // Create new folder
        const folders = yield db_1.db.query(`INSERT INTO folders (name, user_id) VALUES ($1, $2) RETURNING *`, [name, (_d = req.user) === null || _d === void 0 ? void 0 : _d.id]);
        res.status(200).json({
            status: 'success',
            data: {
                folders: folders.rows[0],
            }
        });
    }
    catch (error) {
        console.log(error);
        next(error);
    }
}));
//Adds File to Folder
router.post('/api/folder/:id', current_user_1.currentUser, require_auth_1.requireAuth, [
    (0, express_validator_1.body)('file')
        .isString()
        .trim()
        .withMessage('File ID must be defined'),
], validate_request_1.validateRequest, (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _e, _f;
    const { file } = req.body;
    try {
        // Check if folder exists
        const existingFolder = yield db_1.db.query(`SELECT * FROM folders WHERE id = $1 AND user_id = $2`, [req.params.id, (_e = req.user) === null || _e === void 0 ? void 0 : _e.id]);
        if (!existingFolder.rows.length) {
            throw new bad_request_error_1.BadRequestError('Folder does not exist');
        }
        // Check if file exists
        const existingFile = yield db_1.db.query(`SELECT * FROM files WHERE id = $1 AND user_id = $2`, [file, (_f = req.user) === null || _f === void 0 ? void 0 : _f.id]);
        if (!existingFile.rows.length) {
            throw new bad_request_error_1.BadRequestError('File does not exist');
        }
        // Add file to folder
        const updateFile = yield db_1.db.query(`UPDATE files SET folder_id = $1 WHERE id = $2 RETURNING *`, [req.params.id, file]);
        res.status(200).json({
            status: 'success',
            data: {
                file: updateFile.rows[0],
            }
        });
    }
    catch (error) {
        console.log(error);
        next(error);
    }
}));
