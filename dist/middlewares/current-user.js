"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.currentUser = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const not_authorized_error_1 = require("../errors/not-authorized-error");
const currentUser = (req, res, next) => {
    const bearer = req.headers.authorization;
    if (!bearer || !bearer.startsWith('Bearer ')) {
        throw new not_authorized_error_1.NotAuthorizedError();
    }
    const token = bearer.split(' ')[1].trim();
    try {
        const payload = jsonwebtoken_1.default.verify(token, process.env.JWT_KEY);
        req.user = payload;
    }
    catch (err) {
        console.log(err);
    }
    next();
};
exports.currentUser = currentUser;
