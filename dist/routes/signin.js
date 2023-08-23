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
exports.signinRouter = void 0;
const express_1 = __importDefault(require("express"));
const express_validator_1 = require("express-validator");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const db_1 = require("../db");
const validate_request_1 = require("../middlewares/validate-request");
const bad_request_error_1 = require("../errors/bad-request-error");
const password_1 = require("../utils/password");
const router = express_1.default.Router();
exports.signinRouter = router;
router.post('/api/users/signin', [
    (0, express_validator_1.body)('email').isEmail().withMessage('Email must be valid'),
    (0, express_validator_1.body)('password')
        .trim()
        .isLength({ min: 4, max: 20 })
        .withMessage('Password must be between 4 and 20 characters'),
], validate_request_1.validateRequest, (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, password } = req.body;
    try {
        // Check if user exists
        const existingUser = yield db_1.db.query(`SELECT * FROM users WHERE email = $1`, [email]);
        if (!existingUser.rows.length) {
            throw new bad_request_error_1.BadRequestError(' Invalid Credentials');
        }
        const user = existingUser.rows[0];
        const isMatch = yield (0, password_1.comparePassword)(password, user.password);
        if (!isMatch) {
            throw new bad_request_error_1.BadRequestError(' Invalid Credentials');
        }
        // Generate JWT
        const userJwt = jsonwebtoken_1.default.sign({
            id: user.id,
            email: user.email,
        }, process.env.JWT_KEY);
        res.status(201).json({
            status: 'success',
            data: {
                user: {
                    id: user.id,
                    email: user.email,
                    fullname: user.fullname,
                },
                token: userJwt,
            },
        });
    }
    catch (error) {
        console.log(error);
        next(error);
    }
}));
