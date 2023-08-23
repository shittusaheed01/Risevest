"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.multerMiddleware = void 0;
const multer_1 = __importDefault(require("multer"));
const upload = (0, multer_1.default)({
    dest: 'files',
    limits: {
        fileSize: 200 * 1024 * 1024, // 200MB in bytes
    },
}).single('file');
const multerMiddleware = (req, res, next) => {
    upload(req, res, function (err) {
        if (err) {
            return res.status(400).json({
                errors: [
                    {
                        message: err.message
                    }
                ]
            });
        }
        // console.log(req.file);
        next();
    });
};
exports.multerMiddleware = multerMiddleware;
