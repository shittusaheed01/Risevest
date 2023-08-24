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
exports.signupRouter = void 0;
const express_1 = __importDefault(require("express"));
const express_validator_1 = require("express-validator");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const db_1 = require("../db");
const validate_request_1 = require("../middlewares/validate-request");
const bad_request_error_1 = require("../errors/bad-request-error");
const password_1 = require("../utils/password");
const router = express_1.default.Router();
exports.signupRouter = router;
router.post('/api/users/signup', [
    (0, express_validator_1.body)('email').isEmail().withMessage('Email must be valid'),
    (0, express_validator_1.body)('fullname')
        .isString()
        .trim()
        .withMessage('Full Name must be valid'),
    (0, express_validator_1.body)('password')
        .trim()
        .isLength({ min: 4, max: 20 })
        .withMessage('Password must be between 4 and 20 characters'),
    (0, express_validator_1.body)('role')
        .optional()
        .matches(/^(admin|user)$/)
        .withMessage('Role must be either admin or user'),
], validate_request_1.validateRequest, (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, password, fullname, role = "user" } = req.body;
    try {
        const hashedPassword = yield (0, password_1.hashPassword)(password);
        // Check if user exists
        const existingUser = yield db_1.db.query(`SELECT * FROM users WHERE email = $1`, [email]);
        if (existingUser.rows.length > 0) {
            throw new bad_request_error_1.BadRequestError('Email already in use');
        }
        // Create user
        const newUser = yield db_1.db.query(`INSERT INTO users (email, password, fullname, role) VALUES ($1, $2, $3, $4) RETURNING *`, [email, hashedPassword, fullname, role]);
        const newUserObj = newUser.rows[0];
        const userJwt = jsonwebtoken_1.default.sign({
            id: newUserObj.id,
            email: newUserObj.email,
        }, process.env.JWT_KEY);
        res.status(201).json({
            status: 'success',
            data: {
                user: {
                    id: newUserObj.id,
                    email: newUserObj.email,
                    fullname: newUserObj.fullname,
                    role: newUserObj.role,
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
